import { body, ValidationChain } from 'express-validator';

// Common validation patterns
export const emailValidation = (): ValidationChain => 
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters');

export const passwordValidation = (field = 'password'): ValidationChain => 
  body(field)
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const usernameValidation = (): ValidationChain =>
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens');

export const taskTitleValidation = (): ValidationChain =>
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters')
    .trim();

export const taskDescriptionValidation = (): ValidationChain =>
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
    .trim();

export const taskStatusValidation = (): ValidationChain =>
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in-progress, completed, cancelled');

export const taskPriorityValidation = (): ValidationChain =>
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent');

export const dueDateValidation = (): ValidationChain =>
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    });

export const tagsValidation = (): ValidationChain =>
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
    .custom((tags: string[]) => {
      if (tags.some((tag: string) => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    });

// Validation chains for common use cases
export const registerValidation = [
  usernameValidation(),
  emailValidation(),
  passwordValidation(),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim(),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim()
];

export const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const createTaskValidation = [
  taskTitleValidation(),
  taskDescriptionValidation(),
  taskStatusValidation(),
  taskPriorityValidation(),
  dueDateValidation(),
  tagsValidation()
];

export const updateTaskValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters')
    .trim(),
  taskDescriptionValidation(),
  taskStatusValidation(),
  taskPriorityValidation(),
  dueDateValidation(),
  tagsValidation()
];

export const paginationValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  body('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'status', 'priority', 'dueDate'])
    .withMessage('Invalid sort field'),
  body('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Custom validation helpers
export const sanitizeHtml = (value: string): string => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const validateObjectId = (value: string): boolean => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(value);
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const validateFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = filename.toLowerCase().split('.').pop();
  return allowedTypes.includes(extension || '');
};

export const validateFileSize = (size: number, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
};

// Rate limiting helpers
export const getClientIdentifier = (req: any): string => {
  // Try to get user ID first, fallback to IP
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }
  
  // Get IP from various headers
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
  
  return `ip:${ip}`;
};

// Security validation helpers
export const validateApiKey = (apiKey: string): boolean => {
  // Basic API key validation - should be alphanumeric and specific length
  const apiKeyRegex = /^[a-zA-Z0-9]{32,64}$/;
  return apiKeyRegex.test(apiKey);
};

export const validateUserAgent = (userAgent: string): boolean => {
  // Basic user agent validation to prevent obvious bot attempts
  if (!userAgent || userAgent.length > 500) return false;
  
  // Block common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i
  ];
  
  return !botPatterns.some(pattern => pattern.test(userAgent));
};

// Environment-specific validation
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const validateEnvironmentConfig = (): void => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('Warning: JWT_SECRET should be at least 32 characters long');
  }
};