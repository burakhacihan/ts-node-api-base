import { Request, Response, NextFunction } from 'express';
import { z, ZodType } from 'zod';

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{ message: 'Unknown validation error' }],
        });
      }
    }
  };
};

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      (req as any).validatedParams = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{ message: 'Unknown validation error' }],
        });
      }
    }
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      (req as any).validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: [{ message: 'Unknown validation error' }],
        });
      }
    }
  };
};
