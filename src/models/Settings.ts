import mongoose, { Document, Schema } from "mongoose";
import { BankDetails } from "../types/settings";

export interface SettingsDocument extends Document {
	userId: string;
	companyName: string;
	gstNumber: string;
	panNumber: string;
	proprietorName: string;
	bankDetails: BankDetails;
	contactNumber: string;
	companyAddress: string;
}

const bankDetailsSchema = new Schema<BankDetails>(
	{
		bankName: {
			type: String,
			required: [true, "Bank name is required"],
			trim: true
		},
		ifscCode: {
			type: String,
			required: [true, "IFSC code is required"],
			trim: true,
			uppercase: true
		},
		accountNumber: {
			type: String,
			required: [true, "Account number is required"],
			trim: true
		},
		branchName: {
			type: String,
			required: [true, "Branch name is required"],
			trim: true
		}
	},
	{ _id: false }
);

const settingsSchema = new Schema<SettingsDocument>(
	{
		userId: {
			type: String,
			required: [true, "User ID is required"],
			unique: true,
			index: true
		},
		companyName: {
			type: String,
			required: [true, "Company name is required"],
			trim: true
		},
		gstNumber: {
			type: String,
			required: [true, "GST number is required"],
			trim: true,
			uppercase: true
		},
		panNumber: {
			type: String,
			required: [true, "PAN number is required"],
			trim: true,
			uppercase: true
		},
		proprietorName: {
			type: String,
			required: [true, "Proprietor name is required"],
			trim: true
		},
		bankDetails: {
			type: bankDetailsSchema,
			required: [true, "Bank details are required"]
		},
		contactNumber: {
			type: String,
			required: [true, "Contact number is required"],
			trim: true
		},
		companyAddress: {
			type: String,
			required: [true, "Company address is required"],
			trim: true
		}
	},
	{
		timestamps: true
	}
);

settingsSchema.index({ userId: 1 });

const Settings = mongoose.model<SettingsDocument>("Settings", settingsSchema);

export default Settings;
