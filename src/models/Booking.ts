import mongoose, { Document, Schema } from "mongoose";

export interface BookingDocument extends Document {
	name: string;
	phoneNumber: string;
	date: Date;
	time: string;
	pickup: string;
	drop: string;
	description: string;
	vehicle: string;
}

const bookingSchema = new Schema<BookingDocument>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true
		},
		phoneNumber: {
			type: String,
			required: [true, "Phone number is required"],
			trim: true
		},
		date: {
			type: Date,
			required: [true, "Date is required"]
		},
		time: {
			type: String,
			required: [true, "Time is required"],
			trim: true
		},
		pickup: {
			type: String,
			required: [true, "Pickup location is required"],
			trim: true
		},
		drop: {
			type: String,
			required: [true, "Drop location is required"],
			trim: true
		},
		description: {
			type: String,
			required: false,
			trim: true
		},
		vehicle: {
			type: String,
			required: [true, "Vehicle type is required"],
			trim: true
		}
	},
	{
		timestamps: true
	}
);

const Booking = mongoose.model<BookingDocument>("Booking", bookingSchema);

export default Booking;