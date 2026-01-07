import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../config/config";
import { UnauthorizedError } from "../utils/errors";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
      };
    }
  }
}

export interface JwtPayload {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware za autentifikaciju - zahteva validan JWT token
 */
export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Pristup odbijen. Token nije prosleđen.");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Pristup odbijen. Token nije prosleđen.");
    }

    if (!JWT_KEY) {
      throw new Error("JWT_KEY nije konfigurisan");
    }

    const decoded = jwt.verify(token, JWT_KEY) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Nevažeći token",
      });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token je istekao",
      });
      return;
    }
    next(error);
  }
}

/**
 * Opcioni auth middleware - ne zahteva token, ali ako postoji, dekodira ga
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token && JWT_KEY) {
        const decoded = jwt.verify(token, JWT_KEY) as JwtPayload;
        req.user = decoded;
      }
    }
    next();
  } catch {
    // Ignoriši greške, nastavi bez user-a
    next();
  }
}

/**
 * Middleware za proveru admin role
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Pristup odbijen",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Nemate dozvolu za ovu akciju",
    });
    return;
  }

  next();
}

/**
 * Middleware za proveru admin ili moderator role
 */
export function moderatorOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Pristup odbijen",
    });
    return;
  }

  if (req.user.role !== "admin" && req.user.role !== "moderator") {
    res.status(403).json({
      success: false,
      message: "Nemate dozvolu za ovu akciju",
    });
    return;
  }

  next();
}
