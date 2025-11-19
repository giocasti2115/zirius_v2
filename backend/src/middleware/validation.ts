// Stub temporal para middleware/validation
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Stub validation - siempre pasa
  next();
};

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  // Stub validation - siempre pasa
  next();
};