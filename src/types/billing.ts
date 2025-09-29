// Billing-related interfaces
export interface BillingItem {
	description: string;
	hsnSac: string;
	unit: string;
	quantity: number;
	rate: number;
	totalAmount: number;
}

export interface BankDetails {
	bankName: string;
	branch: string;
	accountNumber: string;
	ifscCode: string;
}

export interface BillingInterface {
	_id?: string;
	userId: string;
	companyName: string;
	vehicleIds?: string[]; // Support for multiple vehicles
	billingDate: Date;
	recipientName: string;
	recipientAddress: string;
	workingTime: string;
	period: string;
	projectLocation: string;
	placeOfSupply: string;
	billingItems: BillingItem[];
	totalInvoiceValue: number;
	bankDetails: BankDetails;
	isCompleted: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateBillingRequest {
	companyName: string;
	vehicleIds: string[]; // Required field for multiple vehicles
	billingDate?: Date;
	recipientName: string;
	recipientAddress: string;
	workingTime: string;
	period: string;
	projectLocation: string;
	placeOfSupply: string;
	billingItems: BillingItem[];
	bankDetails: BankDetails;
}

export interface UpdateBillingRequest {
	companyName?: string;
	vehicleIds?: string[];
	billingDate?: Date;
	recipientName?: string;
	recipientAddress?: string;
	workingTime?: string;
	period?: string;
	projectLocation?: string;
	placeOfSupply?: string;
	billingItems?: BillingItem[];
	bankDetails?: BankDetails;
	totalInvoiceValue?: number;
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
	totalAmount: number;
}

export interface BillingExportRequest {
	format: "pdf" | "excel";
	billingId: string;
}