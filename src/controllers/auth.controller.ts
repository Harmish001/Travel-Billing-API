import { Request, Response } from "express";
import passport from "passport";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import JWTService from "../utils/jwt.service";
import { ApiResponse } from "../types";

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

export const register = async (req: Request, res: Response) => {
	try {
		const {
			email,
			password,
			businessName,
			role = "user"
		} = req.body as RegisterRequest;

		if (!email || !password || !businessName) {
			const response: ApiResponse = {
				status: false,
				message: "Email, password, and business name are required",
				data: null
			};
			return res.status(400).json(response);
		}

		if (password.length < 6) {
			const response: ApiResponse = {
				status: false,
				message: "Password must be at least 6 characters long",
				data: null
			};
			return res.status(400).json(response);
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			const response: ApiResponse = {
				status: false,
				message: "User with this email already exists",
				data: null
			};
			return res.status(400).json(response);
		}

		const newUser = await User.create({
			email,
			password,
			businessName,
			role
		});

		const token = JWTService.generateToken({
			userId: newUser._id.toString(),
			email: newUser.email,
			role: newUser.role
		});

		const response: ApiResponse = {
			status: true,
			message: "User registered successfully",
			data: {
				user: newUser,
				token
			}
		};
		return res.status(201).json(response);
	} catch (error: any) {
		console.error("Registration error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Registration failed",
			data: null
		};
		return res.status(500).json(response);
	}
};

export const login = (req: Request, res: Response) => {
	passport.authenticate(
		"local",
		{ session: false },
		(err: any, user: any, info: any) => {
			if (err) {
				const response: ApiResponse = {
					status: false,
					message: "Login error",
					data: null
				};
				return res.status(500).json(response);
			}

			if (!user) {
				const response: ApiResponse = {
					status: false,
					message: info?.message || "Invalid credentials",
					data: null
				};
				return res.status(401).json(response);
			}

			const token = JWTService.generateToken({
				userId: user._id.toString(),
				email: user.email,
				role: user.role
			});

			const response: ApiResponse = {
				status: true,
				message: "Login successful",
				data: {
					user,
					token
				}
			};
			return res.json(response);
		}
	)(req, res);
};

export const getProfile = (req: AuthRequest, res: Response) => {
	const response: ApiResponse = {
		status: true,
		message: "Profile retrieved successfully",
		data: {
			user: req.user
		}
	};
	return res.json(response);
};

export const logout = (req: AuthRequest, res: Response) => {
	const response: ApiResponse = {
		status: true,
		message: "Logout successful",
		data: null
	};
	return res.json(response);
};

export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body as ForgotPasswordRequest;

		if (!email) {
			const response: ApiResponse = {
				status: false,
				message: "Email is required",
				data: null
			};
			return res.status(400).json(response);
		}

		const user = await User.findOne({ email });
		if (!user) {
			const response: ApiResponse = {
				status: false,
				message: "No user found with this email address",
				data: null
			};
			return res.status(404).json(response);
		}

		const resetToken = JWTService.generateResetToken(user._id.toString());

		const response: ApiResponse = {
			status: true,
			message: "Password reset instructions sent to your email",
			data: {
				resetToken: process.env.NODE_ENV === "development" ? resetToken : null
			}
		};
		return res.json(response);
	} catch (error: any) {
		console.error("Forgot password error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to process password reset request",
			data: null
		};
		return res.status(500).json(response);
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { token, newPassword } = req.body as ResetPasswordRequest;

		if (!token || !newPassword) {
			const response: ApiResponse = {
				status: false,
				message: "Reset token and new password are required",
				data: null
			};
			return res.status(400).json(response);
		}

		if (newPassword.length < 6) {
			const response: ApiResponse = {
				status: false,
				message: "Password must be at least 6 characters long",
				data: null
			};
			return res.status(400).json(response);
		}

		const decoded = JWTService.verifyResetToken(token);

		const user = await User.findById(decoded.userId);
		if (!user) {
			const response: ApiResponse = {
				status: false,
				message: "User not found",
				data: null
			};
			return res.status(404).json(response);
		}

		user.password = newPassword;
		await user.save();

		const response: ApiResponse = {
			status: true,
			message: "Password reset successfully",
			data: null
		};
		return res.json(response);
	} catch (error: any) {
		console.error("Reset password error:", error);

		if (
			error.name === "JsonWebTokenError" ||
			error.message === "Invalid reset token"
		) {
			const response: ApiResponse = {
				status: false,
				message: "Invalid reset token",
				data: null
			};
			return res.status(400).json(response);
		}

		if (error.name === "TokenExpiredError") {
			const response: ApiResponse = {
				status: false,
				message: "Reset token has expired",
				data: null
			};
			return res.status(400).json(response);
		}

		const response: ApiResponse = {
			status: false,
			message: "Failed to reset password",
			data: null
		};
		return res.status(500).json(response);
	}
};
