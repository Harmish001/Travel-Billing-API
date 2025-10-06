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
}