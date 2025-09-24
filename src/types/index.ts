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

// Billing-related interfaces
export interface BillingInterface {
  _id?: string;
  userId: string;
  companyName: string;
  vehicleId: string;
  billingDate: Date;
  recipientName: string;
  recipientAddress: string;
  workingTime: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateBillingRequest {
  companyName: string;
  vehicleId: string;
  billingDate?: Date;
  recipientName: string;
  recipientAddress: string;
  workingTime: string;
  hsnCode?: string;
  quantity?: number;
  rate: number;
}

export interface UpdateBillingRequest {
  companyName?: string;
  vehicleId?: string;
  billingDate?: Date;
  recipientName?: string;
  recipientAddress?: string;
  workingTime?: string;
  hsnCode?: string;
  quantity?: number;
  rate?: number;
}

export interface BillingSearchFilters {
  searchQuery?: string;
  companyName?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  isCompleted?: boolean;
  page?: number;
  limit?: number;
}

export interface BillingPaginationResponse {
  bills: BillingInterface[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBills: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BillingStatsResponse {
  totalBills: number;
  totalRevenue: number;
  monthlyBills: number;
  monthlyRevenue: number;
  recentBills: BillingInterface[];
}

export interface BillingCalculation {
  quantity: number;
  rate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  taxRate: number;
}

export interface BillingExportRequest {
  format: 'pdf' | 'excel';
  billingId: string;
}
