import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error.middleware';

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HTTPS only)
  if (req.secure || req.get('X-Forwarded-Proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self';"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (Feature Policy)
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  
  next();
};

// Request size limiter
export const requestSizeLimit = (maxSize: number = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    
    if (contentLength) {
      const sizeMB = parseInt(contentLength) / (1024 * 1024);
      if (sizeMB > maxSize) {
        throw new ApiError(413, `Request too large. Maximum size allowed: ${maxSize}MB`);
      }
    }
    
    next();
  };
};

// IP whitelist/blacklist middleware
export const ipFilter = (options: {
  whitelist?: string[];
  blacklist?: string[];
  message?: string;
}) => {
  const { whitelist, blacklist, message = 'Access denied' } = options;
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = getClientIP(req);
    
    // Check blacklist first
    if (blacklist && blacklist.includes(clientIp)) {
      throw new ApiError(403, message);
    }
    
    // Check whitelist
    if (whitelist && whitelist.length > 0 && !whitelist.includes(clientIp)) {
      throw new ApiError(403, message);
    }
    
    next();
  };
};

// User agent validation
export const userAgentValidator = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent');
  
  if (!userAgent) {
    throw new ApiError(400, 'User-Agent header is required');
  }
  
  // Block obvious bots and scrapers
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /http/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && process.env.NODE_ENV === 'production') {
    // Log suspicious activity
    console.warn(`Suspicious User-Agent detected: ${userAgent} from IP: ${getClientIP(req)}`);
    
    // Optionally block or add additional verification
    if (req.path.includes('/api/')) {
      throw new ApiError(403, 'Access denied');
    }
  }
  
  next();
};

// Request origin validation
export const originValidator = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get('Origin') || req.get('Referer');
    
    if (req.method === 'GET') {
      return next(); // Allow GET requests without origin check
    }
    
    if (!origin) {
      throw new ApiError(400, 'Origin header is required for this request');
    }
    
    const originUrl = new URL(origin);
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2);
        return originUrl.hostname.endsWith(domain);
      }
      return originUrl.hostname === allowed;
    });
    
    if (!isAllowed) {
      throw new ApiError(403, 'Request from unauthorized origin');
    }
    
    next();
  };
};

// SQL injection prevention
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // '(o|O)(r|R)
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /script\b.*?\/script\b/i
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };
  
  // Check query parameters
  if (checkValue(req.query)) {
    console.warn(`Potential SQL injection in query: ${JSON.stringify(req.query)} from IP: ${getClientIP(req)}`);
    throw new ApiError(400, 'Invalid request parameters');
  }
  
  // Check request body
  if (req.body && checkValue(req.body)) {
    console.warn(`Potential SQL injection in body: ${JSON.stringify(req.body)} from IP: ${getClientIP(req)}`);
    throw new ApiError(400, 'Invalid request data');
  }
  
  next();
};

// XSS protection
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*src[^>]*onerror[^>]*>/gi,
    /<svg[^>]*on\w+[^>]*>/gi
  ];
  
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return xssPatterns.reduce((acc, pattern) => {
        return acc.replace(pattern, '');
      }, value);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };
  
  // Sanitize query parameters
  req.query = sanitizeValue(req.query);
  
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  
  next();
};

// CSRF protection for non-API routes
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for API routes with proper authentication
  if (req.path.startsWith('/api/') && req.get('Authorization')) {
    return next();
  }
  
  // Skip for safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const csrfToken = req.get('X-CSRF-Token') || req.body.csrfToken;
  const sessionCsrfToken = (req as any).session?.csrfToken;
  
  if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken) {
    throw new ApiError(403, 'Invalid CSRF token');
  }
  
  next();
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          message: 'The request took too long to complete'
        });
      }
    }, timeoutMs);
    
    // Clear timeout when response is finished
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    res.on('close', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
};

// Helper function to get client IP
export const getClientIP = (req: Request): string => {
  const forwarded = req.get('X-Forwarded-For');
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0])
    : req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
  
  return ip || 'unknown';
};

// Request logging for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const securityInfo = {
    ip: getClientIP(req),
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    userId: (req as any).user?.id || 'anonymous'
  };
  
  // Log suspicious activities
  const suspiciousIndicators = [
    req.url.includes('../'),
    req.url.includes('admin') && !(req as any).user?.role === 'admin',
    req.get('User-Agent')?.length > 500,
    Object.keys(req.query).length > 20,
    JSON.stringify(req.body || '').length > 50000
  ];
  
  if (suspiciousIndicators.some(Boolean)) {
    console.warn('Suspicious request detected:', securityInfo);
  }
  
  // Store security info for potential analysis
  (req as any).securityInfo = securityInfo;
  
  next();
};

export default {
  securityHeaders,
  requestSizeLimit,
  ipFilter,
  userAgentValidator,
  originValidator,
  sqlInjectionProtection,
  xssProtection,
  csrfProtection,
  requestTimeout,
  securityLogger,
  getClientIP
};