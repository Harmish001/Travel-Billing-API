import mongoose, { Document, Schema } from "mongoose";
import { BillingInterface } from "../types";

export interface BillingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  vehicleId: mongoose.Types.ObjectId;
  billingDate: Date;
  recipientName: string;
  recipientAddress: string;
  workingTime: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const billingSchema = new Schema<BillingDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true, // Index for faster queries by user
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name must be less than 100 characters"],
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle ID is required"],
      index: true, // Index for faster queries by vehicle
    },
    billingDate: {
      type: Date,
      required: [true, "Billing date is required"],
      default: Date.now,
    },
    recipientName: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
      maxlength: [100, "Recipient name must be less than 100 characters"],
    },
    recipientAddress: {
      type: String,
      required: [true, "Recipient address is required"],
      trim: true,
      maxlength: [500, "Recipient address must be less than 500 characters"],
    },
    workingTime: {
      type: String,
      required: [true, "Working time is required"],
      trim: true,
      maxlength: [50, "Working time must be less than 50 characters"],
    },
    hsnCode: {
      type: String,
      required: [true, "HSN/ASC code is required"],
      trim: true,
      default: "996601",
      maxlength: [10, "HSN code must be less than 10 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.01, "Quantity must be greater than 0"],
      max: [999999, "Quantity must be less than 1,000,000"],
      default: 1,
    },
    rate: {
      type: Number,
      required: [true, "Rate is required"],
      min: [0.01, "Rate must be greater than 0"],
      max: [999999999, "Rate must be less than 1 billion"],
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    taxAmount: {
      type: Number,
      required: [true, "Tax amount is required"],
      min: [0, "Tax amount cannot be negative"],
      default: 0,
    },
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },
    isCompleted: {
      type: Boolean,
      default: true,
      index: true, // Index for faster queries by completion status
    },
  },
  {
    timestamps: true,
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
  workingTime: "text",
});

// Auto-calculate fields before saving
billingSchema.pre("save", function (next) {
  // Calculate subtotal
  this.subtotal = Number((this.quantity * this.rate).toFixed(2));
  
  // Calculate tax (18% GST for Indian market - can be configurable)
  const taxRate = 0.18; // 18% GST
  this.taxAmount = Number((this.subtotal * taxRate).toFixed(2));
  
  // Calculate total
  this.total = Number((this.subtotal + this.taxAmount).toFixed(2));
  
  next();
});

// Auto-calculate fields before updating
billingSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;
  
  if (update && (update.quantity !== undefined || update.rate !== undefined)) {
    const quantity = update.quantity || 1;
    const rate = update.rate || 0;
    
    // Calculate subtotal
    const subtotal = Number((quantity * rate).toFixed(2));
    update.subtotal = subtotal;
    
    // Calculate tax (18% GST)
    const taxRate = 0.18;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    update.taxAmount = taxAmount;
    
    // Calculate total
    update.total = Number((subtotal + taxAmount).toFixed(2));
  }
  
  next();
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
    query.vehicleId = filters.vehicleId;
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
    .populate("vehicleId", "vehicleNumber")
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
      hasPrev: page > 1,
    },
  };
};

// Static method to get billing statistics for dashboard
billingSchema.statics.getBillingStats = async function (userId: string) {
  const totalBills = await this.countDocuments({ userId, isCompleted: true });
  
  const recentBills = await this.find({ userId, isCompleted: true })
    .populate("vehicleId", "vehicleNumber")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  
  // Calculate total revenue (sum of all completed bills)
  const revenueResult = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), isCompleted: true } },
    { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
  ]);
  
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
  
  // Get monthly stats (current month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const monthlyBills = await this.countDocuments({
    userId,
    isCompleted: true,
    createdAt: { $gte: startOfMonth },
  });
  
  const monthlyRevenueResult = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isCompleted: true,
        createdAt: { $gte: startOfMonth },
      },
    },
    { $group: { _id: null, monthlyRevenue: { $sum: "$total" } } },
  ]);
  
  const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].monthlyRevenue : 0;
  
  return {
    totalBills,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    monthlyBills,
    monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
    recentBills,
  };
};

const Billing = mongoose.model<BillingDocument>("Billing", billingSchema);

export default Billing;