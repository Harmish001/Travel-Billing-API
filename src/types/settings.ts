export interface BankDetails {
	bankName: string;
	ifscCode: string;
	accountNumber: string;
	branchName: string;
}

export interface SettingsInterface {
	_id?: string;
	userId: string;
	companyName: string;
	gstNumber: string;
	panNumber: string;
	proprietorName: string;
	bankDetails: BankDetails;
	contactNumber: string;
	companyAddress: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateSettingsRequest {
	companyName: string;
	gstNumber: string;
	panNumber: string;
	proprietorName: string;
	bankDetails: BankDetails;
	contactNumber: string;
	companyAddress: string;
}

export interface UpdateSettingsRequest {
	companyName?: string;
	gstNumber?: string;
	panNumber?: string;
	proprietorName?: string;
	bankDetails?: BankDetails;
	contactNumber?: string;
	companyAddress?: string;
}
