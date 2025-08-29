import { Router } from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  getAllUsers, 
  updateUserStatus, 
  getUserStats 
} from '../controllers/users.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { apiRateLimit, authRateLimit } from '../middleware/rate-limit.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

// Profile routes
router.get('/profile', 
  authenticateToken, 
  apiRateLimit.middleware,
  getUserProfile
);

router.put('/profile',
  authenticateToken,
  apiRateLimit.middleware,
  [
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be between 1 and 50 characters'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters')
  ],
  validateRequest,
  updateUserProfile
);

// Password change
router.post('/change-password',
  authenticateToken,
  authRateLimit.middleware,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
  ],
  validateRequest,
  changePassword
);

// Admin routes
router.get('/',
  authenticateToken,
  apiRateLimit.middleware,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters'),
    query('role')
      .optional()
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('Role must be user, admin, or moderator')
  ],
  validateRequest,
  getAllUsers
);

router.patch('/:id/status',
  authenticateToken,
  apiRateLimit.middleware,
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean value')
  ],
  validateRequest,
  updateUserStatus
);

router.get('/stats',
  authenticateToken,
  apiRateLimit.middleware,
  getUserStats
);

export default router;