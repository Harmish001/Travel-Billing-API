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
