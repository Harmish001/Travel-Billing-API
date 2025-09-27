// Billing-related interfaces
export interface BillingInterface {
	_id?: string;
	userId: string;
	companyName: string;
	vehicleId: string;
	vehicleIds?: string[]; // Support for multiple vehicles
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
	vehicleId?: string; // Keep for backward compatibility
	vehicleIds?: string[]; // New field for multiple vehicles
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
	vehicleId?: string; // Keep for backward compatibility
	vehicleIds?: string[]; // New field for multiple vehicles
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
	format: "pdf" | "excel";
	billingId: string;
}