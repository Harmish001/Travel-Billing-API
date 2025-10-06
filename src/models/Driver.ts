import mongoose, { Document, Schema } from "mongoose";

export interface DriverDocument extends Document {
	driverName: string;
	driverPhoneNumber: string;
	driverImage?: string;
	userId: string;
}

const driverSchema = new Schema<DriverDocument>(
	{
		driverName: {
			type: String,
			required: [true, "Driver name is required"],
			trim: true
		},
		driverPhoneNumber: {
			type: String,
			required: [true, "Driver phone number is required"],
			trim: true
		},
		driverImage: {
			type: String,
			required: false
		},
		userId: {
			type: String,
			required: [true, "User ID is required"],
			index: true
		}
	},
	{
		timestamps: true
	}
);

const Driver = mongoose.model<DriverDocument>("Driver", driverSchema);

export default Driver;
