import { Router } from 'express';
import { 
  getAnalyticsOverview, 
  getTaskAnalytics, 
  getProductivityMetrics, 
  exportAnalyticsData 
} from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { apiRateLimit, exportRateLimit } from '../middleware/rate-limit.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { query } from 'express-validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting endpoints
 */

// Overview analytics
router.get('/overview', 
  authenticateToken,
  apiRateLimit.middleware,
  getAnalyticsOverview
);

// Task analytics
router.get('/tasks',
  authenticateToken,
  apiRateLimit.middleware,
  [
    query('period')
      .optional()
      .isIn(['7d', '30d', '90d', '1y'])
      .withMessage('Period must be one of: 7d, 30d, 90d, 1y')
  ],
  validateRequest,
  getTaskAnalytics
);

// Productivity metrics
router.get('/productivity',
  authenticateToken,
  apiRateLimit.middleware,
  getProductivityMetrics
);

// Data export
router.get('/export',
  authenticateToken,
  exportRateLimit.middleware,
  [
    query('type')
      .optional()
      .isIn(['tasks', 'users', 'analytics'])
      .withMessage('Export type must be one of: tasks, users, analytics'),
    query('format')
      .optional()
      .isIn(['csv', 'json'])
      .withMessage('Export format must be csv or json')
  ],
  validateRequest,
  exportAnalyticsData
);

export default router;