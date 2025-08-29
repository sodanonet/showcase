import { Request, Response } from 'express';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { ApiError } from '../middleware/error.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     AnalyticsOverview:
 *       type: object
 *       properties:
 *         totalTasks:
 *           type: number
 *         completedTasks:
 *           type: number
 *         pendingTasks:
 *           type: number
 *         totalUsers:
 *           type: number
 *         activeUsers:
 *           type: number
 *         completionRate:
 *           type: number
 *         averageTasksPerUser:
 *           type: number
 *     TaskAnalytics:
 *       type: object
 *       properties:
 *         byStatus:
 *           type: object
 *         byPriority:
 *           type: object
 *         byMonth:
 *           type: array
 *           items:
 *             type: object
 *         completionTrend:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics overview
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AnalyticsOverview'
 *       401:
 *         description: Unauthorized
 */
export const getAnalyticsOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Build base query - admins see all data, users see only their data
    const taskQuery = userRole === 'admin' ? {} : { user: userId };
    const userQuery = userRole === 'admin' ? {} : { _id: userId };

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      totalUsers,
      activeUsers
    ] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'completed' }),
      Task.countDocuments({ ...taskQuery, status: { $ne: 'completed' } }),
      User.countDocuments(userQuery),
      User.countDocuments({ ...userQuery, isActive: { $ne: false } })
    ]);

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const averageTasksPerUser = totalUsers > 0 ? totalTasks / totalUsers : 0;

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        totalUsers,
        activeUsers,
        completionRate: Math.round(completionRate * 100) / 100,
        averageTasksPerUser: Math.round(averageTasksPerUser * 100) / 100
      }
    });
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch analytics overview');
  }
};

/**
 * @swagger
 * /api/analytics/tasks:
 *   get:
 *     tags: [Analytics]
 *     summary: Get detailed task analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *     responses:
 *       200:
 *         description: Task analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskAnalytics'
 */
export const getTaskAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const baseQuery = userRole === 'admin' ? {} : { user: userId };
    const dateQuery = { ...baseQuery, createdAt: { $gte: startDate } };

    const [
      tasksByStatus,
      tasksByPriority,
      tasksOverTime,
      completionTrend
    ] = await Promise.all([
      // Tasks by status
      Task.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Tasks by priority
      Task.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      
      // Tasks created over time (by day)
      Task.aggregate([
        { $match: dateQuery },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Completion trend (completed tasks over time)
      Task.aggregate([
        { 
          $match: { 
            ...baseQuery, 
            status: 'completed',
            completedAt: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$completedAt' },
              month: { $month: '$completedAt' },
              day: { $dayOfMonth: '$completedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    // Format the data for frontend consumption
    const byStatus = tasksByStatus.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const byPriority = tasksByPriority.reduce((acc: any, item: any) => {
      acc[item._id || 'medium'] = item.count;
      return acc;
    }, {});

    // Format time series data
    const formatTimeSeriesData = (data: any[]) => {
      return data.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        count: item.count
      }));
    };

    res.json({
      success: true,
      data: {
        byStatus,
        byPriority,
        createdOverTime: formatTimeSeriesData(tasksOverTime),
        completionTrend: formatTimeSeriesData(completionTrend),
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    });
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch task analytics');
  }
};

/**
 * @swagger
 * /api/analytics/productivity:
 *   get:
 *     tags: [Analytics]
 *     summary: Get user productivity metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Productivity metrics retrieved successfully
 */
export const getProductivityMetrics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const baseQuery = userRole === 'admin' ? {} : { user: userId };

    const [
      tasksCompletedToday,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
      averageCompletionTime,
      productivityByHour
    ] = await Promise.all([
      // Tasks completed today
      Task.countDocuments({
        ...baseQuery,
        status: 'completed',
        completedAt: { 
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) 
        }
      }),
      
      // Tasks completed this week
      Task.countDocuments({
        ...baseQuery,
        status: 'completed',
        completedAt: { $gte: lastWeek }
      }),
      
      // Tasks completed this month
      Task.countDocuments({
        ...baseQuery,
        status: 'completed',
        completedAt: { $gte: lastMonth }
      }),
      
      // Average completion time
      Task.aggregate([
        {
          $match: {
            ...baseQuery,
            status: 'completed',
            completedAt: { $exists: true }
          }
        },
        {
          $project: {
            completionTime: {
              $subtract: ['$completedAt', '$createdAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgCompletionTime: { $avg: '$completionTime' }
          }
        }
      ]),
      
      // Productivity by hour of day
      Task.aggregate([
        {
          $match: {
            ...baseQuery,
            status: 'completed',
            completedAt: { $gte: lastMonth }
          }
        },
        {
          $group: {
            _id: { $hour: '$completedAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    // Calculate average completion time in days
    const avgCompletionDays = averageCompletionTime.length > 0 
      ? Math.round((averageCompletionTime[0].avgCompletionTime / (1000 * 60 * 60 * 24)) * 100) / 100
      : 0;

    // Format productivity by hour
    const hourlyProductivity = Array.from({ length: 24 }, (_, hour) => {
      const data = productivityByHour.find(item => item._id === hour);
      return {
        hour,
        count: data ? data.count : 0
      };
    });

    res.json({
      success: true,
      data: {
        tasksCompletedToday,
        tasksCompletedThisWeek,
        tasksCompletedThisMonth,
        averageCompletionDays: avgCompletionDays,
        hourlyProductivity,
        streak: {
          // This could be enhanced to calculate actual streaks
          current: tasksCompletedToday > 0 ? 1 : 0,
          longest: Math.max(tasksCompletedThisWeek, 1)
        }
      }
    });
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch productivity metrics');
  }
};

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     tags: [Analytics]
 *     summary: Export analytics data (CSV format)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [tasks, users, analytics]
 *           default: tasks
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *     responses:
 *       200:
 *         description: Data exported successfully
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 */
export const exportAnalyticsData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    const { type = 'tasks', format = 'csv' } = req.query;

    const baseQuery = userRole === 'admin' ? {} : { user: userId };

    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];

    switch (type) {
      case 'tasks':
        data = await Task.find(baseQuery)
          .populate('user', 'username email')
          .sort({ createdAt: -1 })
          .lean();
        
        filename = 'tasks_export';
        headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'User', 'Created', 'Completed'];
        
        data = data.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority || 'medium',
          user: (task.user as any)?.username || 'Unknown',
          created: task.createdAt,
          completed: task.completedAt || ''
        }));
        break;
      
      case 'users':
        if (userRole !== 'admin') {
          throw new ApiError(403, 'Admin access required for user export');
        }
        
        data = await User.find()
          .select('-password')
          .sort({ createdAt: -1 })
          .lean();
        
        filename = 'users_export';
        headers = ['ID', 'Username', 'Email', 'Role', 'Active', 'Created', 'Last Login'];
        
        data = data.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          active: user.isActive !== false ? 'Yes' : 'No',
          created: user.createdAt,
          lastLogin: user.lastLogin || ''
        }));
        break;
      
      default:
        throw new ApiError(400, 'Invalid export type');
    }

    if (format === 'csv') {
      // Convert to CSV
      const csvRows = [headers.join(',')];
      data.forEach(row => {
        const values = headers.map(header => {
          const key = header.toLowerCase().replace(' ', '');
          let value = row[key] || '';
          
          // Handle dates
          if (value instanceof Date) {
            value = value.toISOString();
          }
          
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value;
        });
        csvRows.push(values.join(','));
      });

      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON
      res.json({
        success: true,
        data,
        exportedAt: new Date(),
        totalRecords: data.length
      });
    }
  } catch (error) {
    throw new ApiError(500, 'Failed to export data');
  }
};