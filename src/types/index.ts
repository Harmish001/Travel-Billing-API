import { Document } from "mongoose";
import {
	DriverInterface,
	CreateDriverRequest,
	UpdateDriverRequest
} from "./driver";
import { BookingInterface, CreateBookingRequest } from "./booking";

export interface UserInterface {
	_id?: any;
	email: string;
	password: string;
	role: "user" | "admin";
	businessName: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface AuthRequest extends Request {
	user?: UserInterface;
}

export interface JWTPayload {
	userId: string;
	email: string;
	role: string;
}

export interface ApiResponse<T = any> {
	status: boolean;
	message: string;
	data: T | null;
}

export interface AuthResponseData {
	user: UserInterface;
	token: string;
}

export type { DriverInterface, CreateDriverRequest, UpdateDriverRequest };
export type { BookingInterface, CreateBookingRequest };
