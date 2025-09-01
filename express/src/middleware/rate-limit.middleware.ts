import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message || 'Too many requests, please try again later',
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      keyGenerator: config.keyGenerator || ((req: Request) => req.ip || 'unknown')
    };

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  public middleware = (req: Request, res: Response, next: NextFunction): void => {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const windowResetTime = now + this.config.windowMs;

    // Initialize or reset if window expired
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: windowResetTime
      };
    }

    // Check if limit exceeded
    if (this.store[key].count >= this.config.maxRequests) {
      const remainingTime = Math.ceil((this.store[key].resetTime - now) / 1000);
      
      res.status(429).json({
        success: false,
        error: this.config.message,
        retryAfter: remainingTime,
        limit: this.config.maxRequests,
        windowMs: this.config.windowMs
      });
      return;
    }

    // Increment counter
    this.store[key].count++;

    // Add rate limit headers
    const remaining = Math.max(0, this.config.maxRequests - this.store[key].count);
    const resetTimeHeader = Math.ceil(this.store[key].resetTime / 1000);

    res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTimeHeader);

    // Handle response tracking
    const originalSend = res.send;
    res.send = function(this: Response, body?: any) {
      const statusCode = this.statusCode;
      
      // Skip counting based on config
      if (
        (rateLimiter.config.skipSuccessfulRequests && statusCode < 400) ||
        (rateLimiter.config.skipFailedRequests && statusCode >= 400)
      ) {
        rateLimiter.store[key].count--;
      }

      return originalSend.call(this, body);
    };

    const rateLimiter = this;
    next();
  };

  public getRemainingRequests(key: string): number {
    const entry = this.store[key];
    if (!entry || entry.resetTime < Date.now()) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  public resetKey(key: string): void {
    delete this.store[key];
  }

  public getStats(): { totalKeys: number; totalRequests: number } {
    const totalKeys = Object.keys(this.store).length;
    const totalRequests = Object.values(this.store).reduce((sum, entry) => sum + entry.count, 0);
    
    return { totalKeys, totalRequests };
  }
}

// Create rate limiters for different endpoints
export const createRateLimit = (config: RateLimitConfig) => {
  return new RateLimiter(config);
};

// Predefined rate limiters for common use cases
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later'
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per window
  message: 'Too many authentication attempts, please try again later',
  keyGenerator: (req: Request) => {
    // Use IP + user agent for auth attempts
    return `${req.ip}:${req.get('User-Agent')}`;
  }
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'API rate limit exceeded, please slow down your requests'
});

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
  message: 'Upload limit exceeded, please wait before uploading more files'
});

export const exportRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // 3 exports per 5 minutes
  message: 'Export limit exceeded, please wait before requesting more exports'
});

// Advanced rate limiter with user-specific limits
export const createUserRateLimit = (config: RateLimitConfig & {
  getUserId?: (req: Request) => string;
  premiumMultiplier?: number;
}) => {
  const baseRateLimit = createRateLimit(config);
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated and has premium status
    const user = (req as any).user;
    const userId = config.getUserId ? config.getUserId(req) : user?.id;
    
    if (userId) {
      // Use user ID as key instead of IP
      const originalKeyGenerator = config.keyGenerator;
      config.keyGenerator = () => `user:${userId}`;
      
      // Apply premium multiplier if user has premium status
      if (user?.isPremium && config.premiumMultiplier) {
        config.maxRequests = Math.floor(config.maxRequests * config.premiumMultiplier);
      }
    }
    
    return baseRateLimit.middleware(req, res, next);
  };
};

// Rate limit bypass for testing/admin
export const bypassRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  // Allow admins to bypass rate limits
  if (user?.role === 'admin') {
    return next();
  }
  
  // Check for bypass header (for testing)
  if (req.get('X-Rate-Limit-Bypass') === process.env.RATE_LIMIT_BYPASS_TOKEN) {
    return next();
  }
  
  next();
};

// Middleware to add rate limit info to response
export const rateLimitInfo = (req: Request, res: Response, next: NextFunction) => {
  // This can be used to add additional rate limit information to API responses
  const rateLimitData = {
    policy: 'default',
    remaining: res.get('X-RateLimit-Remaining'),
    reset: res.get('X-RateLimit-Reset'),
    limit: res.get('X-RateLimit-Limit')
  };
  
  // Add to request object for use in controllers
  (req as any).rateLimitInfo = rateLimitData;
  
  next();
};