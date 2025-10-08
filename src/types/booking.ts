export interface BookingInterface {
	_id?: string;
	name: string;
	phoneNumber: string;
	date: Date;
	time: string;
	pickup: string;
	drop: string;
	description?: string;
	vehicle: string;
	status: "Pending" | "Completed" | "inProgress"; // Added status field
	createdAt?: Date;
	updatedAt?: Date;
}

export interface CreateBookingRequest {
	name: string;
	phoneNumber: string;
	date: Date;
	time: string;
	pickup: string;
	drop: string;
	description?: string;
	vehicle: string;
	status?: "Pending" | "Completed" | "inProgress"; // Added optional status field
}

// Added interface for date range query parameters
export interface DateRangeQuery {
	startDate?: string;
	endDate?: string;
	page?: string;
	limit?: string;
}