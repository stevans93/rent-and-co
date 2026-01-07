import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware za validaciju request body-ja pomoću Zod scheme
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: "Validacija nije uspela",
          errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Middleware za validaciju query parametara pomoću Zod scheme
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: "Neispravni parametri",
          errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Middleware za validaciju URL parametara pomoću Zod scheme
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        res.status(400).json({
          success: false,
          message: "Neispravni parametri",
          errors,
        });
        return;
      }
      next(error);
    }
  };
}
