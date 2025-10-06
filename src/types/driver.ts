export interface DriverInterface {
	_id?: string;
	driverName: string;
	driverPhoneNumber: string;
	driverImage?: string;
	userId: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateDriverRequest {
	driverName: string;
	driverPhoneNumber: string;
	driverImage?: string;
}

export interface UpdateDriverRequest {
	driverName?: string;
	driverPhoneNumber?: string;
	driverImage?: string;
}