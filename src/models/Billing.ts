import mongoose, { Document, Schema } from "mongoose";
import { BillingItem } from "../types/billing";

export interface BankDetails {
	bankName: string;
	branch: string;
	accountNumber: string;
	ifscCode: string;
}

export interface BillingModel {}
export interface BillingDocument extends Document {
	userId: mongoose.Types.ObjectId;
	companyName: string;
	billingDate: Date;
	recipientName: string;
	recipientAddress: string;
	vehicleIds?: mongoose.Types.ObjectId[];
	workingTime: string;
	period: string;
	projectLocation: string;
	placeOfSupply: string;
	billingItems: BillingItem[];
	totalInvoiceValue: number;
	bankDetails: BankDetails;
	createdAt: Date;
	updatedAt: Date;
	isCompleted: boolean;
	gstEnabled: boolean;
}

const billingSchema = new Schema<BillingDocument>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			index: true // Index for faster queries by user
		},
		companyName: {
			type: String,
			required: [true, "Company name is required"],
			trim: true,
			maxlength: [100, "Company name must be less than 100 characters"]
		},
		// Adding support for multiple vehicles
		vehicleIds: [
			{
				type: Schema.Types.ObjectId,
				ref: "Vehicle",
				index: true
			}
		],
		billingDate: {
			type: Date,
			required: [true, "Billing date is required"],
			default: Date.now
		},
		recipientName: {
			type: String,
			required: [true, "Recipient name is required"],
			trim: true,
			maxlength: [100, "Recipient name must be less than 100 characters"]
		},
		recipientAddress: {
			type: String,
			required: [true, "Recipient address is required"],
			trim: true,
			maxlength: [500, "Recipient address must be less than 500 characters"]
		},
		workingTime: {
			type: String,
			required: [true, "Working time is required"],
			trim: true,
			maxlength: [50, "Working time must be less than 50 characters"]
		},
		period: {
			type: String,
			required: [true, "Period is required"],
			trim: true
		},
		projectLocation: {
			type: String,
			required: [true, "Project location is required"],
			trim: true
		},
		placeOfSupply: {
			type: String,
			required: [true, "Place of supply is required"],
			trim: true
		},
		billingItems: [
			{
				description: { type: String, required: true },
				hsnSac: { type: String, required: true },
				unit: { type: String, required: true },
				quantity: { type: Number, required: true },
				rate: { type: Number, required: true },
				totalAmount: { type: Number, required: true }
			}
		],
		totalInvoiceValue: { type: Number, required: true },
		bankDetails: {
			bankName: { type: String, required: true },
			branch: { type: String, required: true },
			accountNumber: { type: String, required: true },
			ifscCode: { type: String, required: true }
		},
		isCompleted: {
			type: Boolean,
			default: true,
			index: true // Index for faster queries by completion status
		},
		gstEnabled: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true
	}
);

// Compound indexes for efficient queries
billingSchema.index({ userId: 1, createdAt: -1 }); // For user's billing history
billingSchema.index({ userId: 1, companyName: 1 }); // For company-based searches
billingSchema.index({ userId: 1, billingDate: -1 }); // For date-based filtering
billingSchema.index({ userId: 1, isCompleted: 1 }); // For filtering completed bills

// Text index for search functionality
billingSchema.index({
	companyName: "text",
	recipientName: "text",
	workingTime: "text"
});

// Don't return __v in JSON responses
billingSchema.methods.toJSON = function () {
	const billingObject = this.toObject();
	delete billingObject.__v;
	return billingObject;
};

// Static method to find bills by user with search, filter, and pagination
billingSchema.statics.findByUserWithFilters = async function (
	userId: string,
	filters: {
		searchQuery?: string;
		companyName?: string;
		vehicleId?: string;
		dateFrom?: Date;
		dateTo?: Date;
		isCompleted?: boolean;
	} = {},
	page: number = 1,
	limit: number = 10
) {
	const skip = (page - 1) * limit;

	let query: any = { userId };

	// Apply filters
	if (filters.companyName) {
		query.companyName = { $regex: filters.companyName, $options: "i" };
	}

	if (filters.vehicleId) {
		// Search in vehicleIds array
		query.vehicleIds = filters.vehicleId;
	}

	if (filters.dateFrom || filters.dateTo) {
		query.billingDate = {};
		if (filters.dateFrom) {
			query.billingDate.$gte = filters.dateFrom;
		}
		if (filters.dateTo) {
			query.billingDate.$lte = filters.dateTo;
		}
	}

	if (filters.isCompleted !== undefined) {
		query.isCompleted = filters.isCompleted;
	}

	if (filters.searchQuery && filters.searchQuery.trim()) {
		query.$text = { $search: filters.searchQuery.trim() };
	}

	const bills = await this.find(query)
		.populate("vehicleIds", "vehicleNumber")
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean();

	const total = await this.countDocuments(query);

	return {
		bills,
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit),
			totalBills: total,
			hasNext: page < Math.ceil(total / limit),
			hasPrev: page > 1
		}
	};
};

// Static method to get billing statistics for dashboard
billingSchema.statics.getBillingStats = async function (userId: string) {
	const totalBills = await this.countDocuments({ userId, isCompleted: true });

	const recentBills = await this.find({ userId, isCompleted: true })
		.populate("vehicleIds", "vehicleNumber")
		.sort({ createdAt: -1 })
		.limit(5)
		.lean();

	// Calculate total revenue (sum of all completed bills)
	const revenueResult = await this.aggregate([
		{
			$match: { userId: new mongoose.Types.ObjectId(userId), isCompleted: true }
		},
		{ $group: { _id: null, totalRevenue: { $sum: "$totalInvoiceValue" } } }
	]);

	const totalRevenue =
		revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

	// Get monthly stats (current month)
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const monthlyBills = await this.countDocuments({
		userId,
		isCompleted: true,
		createdAt: { $gte: startOfMonth }
	});

	const monthlyRevenueResult = await this.aggregate([
		{
			$match: {
				userId: new mongoose.Types.ObjectId(userId),
				isCompleted: true,
				createdAt: { $gte: startOfMonth }
			}
		},
		{ $group: { _id: null, monthlyRevenue: { $sum: "$totalInvoiceValue" } } }
	]);

	const monthlyRevenue =
		monthlyRevenueResult.length > 0
			? monthlyRevenueResult[0].monthlyRevenue
			: 0;

	return {
		totalBills,
		totalRevenue: Number(totalRevenue.toFixed(2)),
		monthlyBills,
		monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
		recentBills
	};
};

const Billing = mongoose.model<BillingDocument>("Billing", billingSchema);

export default Billing;