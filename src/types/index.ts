import { Document } from "mongoose";

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

export interface VehicleInterface {
  _id?: any;
  userId: string;
  vehicleNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleSearchQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface VehiclePaginationResponse {
  vehicles: VehicleInterface[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalVehicles: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateVehicleRequest {
  vehicleNumber: string;
}

export interface UpdateVehicleRequest {
  vehicleNumber?: string;
}
