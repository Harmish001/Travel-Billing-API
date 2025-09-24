import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { UserDocument } from "../models/User";

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: UserDocument;
}

/**
 * Middleware to protect routes - requires authentication
 */
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: UserDocument) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Authentication error",
          error: err.message,
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. Please login to continue.",
        });
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please login to continue.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }

  next();
};

/**
 * Middleware for optional authentication - doesn't fail if no token
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: UserDocument) => {
      if (user) {
        req.user = user;
      }
      // Continue regardless of authentication status
      next();
    }
  )(req, res, next);
};
