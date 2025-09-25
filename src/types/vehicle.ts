export type VehicleType = 
	| "Car"
	| "Truck"
	| "Van"
	| "Bus"
	| "Motorcycle"
	| "Auto Rickshaw"
	| "Tempo Traveller"
	| "Trailer"
	| "Other";

export interface VehicleInterface {
	_id?: any;
	userId: string;
	vehicleNumber: string;
	vehicleType: VehicleType;
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
	vehicleType: VehicleType;
}

export interface UpdateVehicleRequest {
	vehicleNumber?: string;
	vehicleType?: VehicleType;
}
