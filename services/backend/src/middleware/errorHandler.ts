import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const response: Record<string, any> = {
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
  };

  if (config.nodeEnv === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
