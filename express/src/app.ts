import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db";
import { logger } from "./middleware/logger.middleware";
import { securityHeaders, requestSizeLimit, securityLogger, requestTimeout } from "./middleware/security.middleware";
import { generalRateLimit } from "./middleware/rate-limit.middleware";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/tasks.routes";
import userRoutes from "./routes/users.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { setupSwagger } from "./config/swagger";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Connect to database
connectDB();

// Security middleware (apply early)
app.use(securityHeaders);
app.use(requestTimeout(30000)); // 30 second timeout
app.use(requestSizeLimit(10)); // 10MB limit
app.use(securityLogger);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006']
    : true,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan("combined"));
app.use(logger);

// Rate limiting (apply to all routes)
app.use("/api/", generalRateLimit.middleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation
setupSwagger(app);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
