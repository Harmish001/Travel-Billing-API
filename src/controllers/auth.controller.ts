import { Request, Response } from "express";
import passport from "passport";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import JWTService from "../utils/jwt.service";

interface RegisterRequest {
  email: string;
  password: string;
  businessName: string;
  role?: "user" | "admin";
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const {
        email,
        password,
        businessName,
        role = "user",
      }: RegisterRequest = req.body;

      if (!email || !password || !businessName) {
        return res.status(400).json({
          status: false,
          message: "Email, password, and business name are required",
          data: null,
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: false,
          message: "Password must be at least 6 characters long",
          data: null,
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: "User with this email already exists",
          data: null,
        });
      }

      const newUser = await User.create({
        email,
        password,
        businessName,
        role,
      });

      const token = JWTService.generateToken({
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      });

      return res.status(201).json({
        status: true,
        message: "User registered successfully",
        data: {
          user: newUser,
          token,
        },
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      return res.status(500).json({
        status: false,
        message: "Registration failed",
        data: null,
      });
    }
  }

  login(req: Request, res: Response): void {
    passport.authenticate(
      "local",
      { session: false },
      (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({
            status: false,
            message: "Login error",
            data: null,
          });
        }

        if (!user) {
          return res.status(401).json({
            status: false,
            message: info?.message || "Invalid credentials",
            data: null,
          });
        }

        const token = JWTService.generateToken({
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        });

        return res.json({
          status: true,
          message: "Login successful",
          data: {
            user,
            token,
          },
        });
      }
    )(req, res);
  }

  getProfile(req: AuthRequest, res: Response): Response {
    return res.json({
      status: true,
      message: "Profile retrieved successfully",
      data: {
        user: req.user,
      },
    });
  }

  logout(req: AuthRequest, res: Response): Response {
    return res.json({
      status: true,
      message: "Logout successful",
      data: null,
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email }: ForgotPasswordRequest = req.body;

      if (!email) {
        return res.status(400).json({
          status: false,
          message: "Email is required",
          data: null,
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "No user found with this email address",
          data: null,
        });
      }

      const resetToken = JWTService.generateResetToken(user._id.toString());

      return res.json({
        status: true,
        message: "Password reset instructions sent to your email",
        data: {
          resetToken:
            process.env.NODE_ENV === "development" ? resetToken : null,
        },
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        status: false,
        message: "Failed to process password reset request",
        data: null,
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, newPassword }: ResetPasswordRequest = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          status: false,
          message: "Reset token and new password are required",
          data: null,
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: false,
          message: "Password must be at least 6 characters long",
          data: null,
        });
      }

      const decoded = JWTService.verifyResetToken(token);

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
          data: null,
        });
      }

      user.password = newPassword;
      await user.save();

      return res.json({
        status: true,
        message: "Password reset successfully",
        data: null,
      });
    } catch (error: any) {
      console.error("Reset password error:", error);

      if (
        error.name === "JsonWebTokenError" ||
        error.message === "Invalid reset token"
      ) {
        return res.status(400).json({
          status: false,
          message: "Invalid reset token",
          data: null,
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          status: false,
          message: "Reset token has expired",
          data: null,
        });
      }

      return res.status(500).json({
        status: false,
        message: "Failed to reset password",
        data: null,
      });
    }
  }
}

export default new AuthController();
