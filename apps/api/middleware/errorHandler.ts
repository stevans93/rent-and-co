import { Request, Response, NextFunction } from "express";
import { 
  CustomError, 
  NotFoundError, 
  BadRequestError, 
  UnauthorizedError,
  ServerError 
} from "../utils/errors";

/**
 * Centralizovani error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  // Custom errors
  if (
    err instanceof CustomError ||
    err instanceof NotFoundError ||
    err instanceof BadRequestError ||
    err instanceof UnauthorizedError ||
    err instanceof ServerError
  ) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err instanceof CustomError && err.error ? { error: err.error } : {}),
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: "Validacija nije uspela",
      error: err.message,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(400).json({
      success: false,
      message: `${field} već postoji`,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Nevažeći ID format",
    });
    return;
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: "Došlo je do greške na serveru",
    ...(process.env.NODE_ENV === "development" ? { error: err.message } : {}),
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.path} nije pronađena`,
  });
}
