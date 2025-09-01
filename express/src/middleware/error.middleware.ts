import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  status?: number;
}

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.status = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
