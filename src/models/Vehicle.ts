import mongoose, { Document, Schema } from "mongoose";
import { VehicleType } from "../types/vehicle";

export interface VehicleDocument extends Document {
	userId: mongoose.Types.ObjectId;
	vehicleNumber: string;
	vehicleType: VehicleType;
	createdAt: Date;
	updatedAt: Date;
}

const vehicleSchema = new Schema<VehicleDocument>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			index: true
		},
		vehicleNumber: {
			type: String,
			required: [true, "Vehicle number is required"],
			trim: true,
			uppercase: true,
			maxlength: [20, "Vehicle number must be less than 20 characters"]
		},
		vehicleType: {
			type: String,
			required: [true, "Vehicle type is required"],
			enum: {
				values: [
					"Car",
					"Mini Bus",
					"Truck",
					"Van",
					"Bus",
					"Motorcycle",
					"Auto Rickshaw",
					"Tempo",
					"Tempo Traveller",
					"Trailer",
					"Other"
				],
				message:
					"Invalid vehicle type. Must be one of: Car, Truck, Van, Bus, Motorcycle, Auto Rickshaw, Tempo, Trailer, Tempo Traveller, Mini Bus, Other"
			}
		}
	},
	{
		timestamps: true
	}
);

// Compound index to ensure unique vehicle number per user
vehicleSchema.index({ userId: 1, vehicleNumber: 1 }, { unique: true });

// Index for search functionality
vehicleSchema.index({ vehicleNumber: "text" });

// Custom validation to ensure vehicle number format
vehicleSchema.pre("save", function (next) {
	// Remove extra spaces and convert to uppercase
	this.vehicleNumber = this.vehicleNumber
		.replace(/\s+/g, " ")
		.trim()
		.toUpperCase();
	next();
});

// Don't return __v in JSON responses
vehicleSchema.methods.toJSON = function () {
	const vehicleObject = this.toObject();
	delete vehicleObject.__v;
	return vehicleObject;
};

// Static method to find vehicles by user with search and pagination
vehicleSchema.statics.findByUserWithSearch = async function (
	userId: string,
	searchQuery?: string,
	page: number = 1,
	limit: number = 10
) {
	const skip = (page - 1) * limit;

	let query: any = { userId };

	if (searchQuery && searchQuery.trim()) {
		query.vehicleNumber = {
			$regex: searchQuery.trim(),
			$options: "i"
		};
	}

	const vehicles = await this.find(query)
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean();

	const total = await this.countDocuments(query);

	return {
		vehicles,
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit),
			totalVehicles: total,
			hasNext: page < Math.ceil(total / limit),
			hasPrev: page > 1
		}
	};
};

const Vehicle = mongoose.model<VehicleDocument>("Vehicle", vehicleSchema);

export default Vehicle;
