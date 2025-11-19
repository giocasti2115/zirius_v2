import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404
    }
  });
};