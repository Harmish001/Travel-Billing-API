import { Request, Response } from "express";
import Billing from "../models/Billing";
import Vehicle from "../models/Vehicle";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
// import { PDFService } from "../utils/pdf.service";
// import { ExcelService } from "../utils/excel.service.simple";
import { ApiResponse } from "../types";
import { BillingCalculation, BillingPaginationResponse, BillingSearchFilters, BillingStatsResponse, CreateBillingRequest, UpdateBillingRequest } from "../types/billing";

// Helper function to calculate billing amounts
const calculateBillingAmounts = (
	quantity: number,
	rate: number
): BillingCalculation => {
	const subtotal = Number((quantity * rate).toFixed(2));
	const taxRate = 0.18; // 18% GST
	const taxAmount = Number((subtotal * taxRate).toFixed(2));
	const total = Number((subtotal + taxAmount).toFixed(2));

	return {
		quantity,
		rate,
		subtotal,
		taxAmount,
		total,
		taxRate
	};
};

// Create a new billing
export const createBilling = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const {
			companyName,
			vehicleId,
			billingDate,
			recipientName,
			recipientAddress,
			workingTime,
			hsnCode = "996601",
			quantity = 1,
			rate
		}: CreateBillingRequest = req.body;

		const userId = req.user?._id;

		if (!userId) {
			const response: ApiResponse = {
				status: false,
				message: "User authentication required",
				data: null
			};
			res.status(401).json(response);
			return;
		}

		// Validate required fields
		if (
			!companyName ||
			!vehicleId ||
			!recipientName ||
			!recipientAddress ||
			!workingTime ||
			!rate
		) {
			const response: ApiResponse = {
				status: false,
				message: "All required fields must be provided",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		// Validate numeric fields
		if (quantity <= 0 || rate <= 0) {
			const response: ApiResponse = {
				status: false,
				message: "Quantity and rate must be greater than 0",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		// Verify that the vehicle belongs to the user
		const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
		if (!vehicle) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle not found or doesn't belong to user",
				data: null
			};
			res.status(404).json(response);
			return;
		}

		// Create billing (auto-calculation will be handled by pre-save middleware)
		const billing = await Billing.create({
			userId,
			companyName: companyName.trim(),
			vehicleId,
			billingDate: billingDate ? new Date(billingDate) : new Date(),
			recipientName: recipientName.trim(),
			recipientAddress: recipientAddress.trim(),
			workingTime: workingTime.trim(),
			hsnCode: hsnCode.trim(),
			quantity,
			rate,
			isCompleted: true
		});

		// Populate vehicle information
		await billing.populate("vehicleId", "vehicleNumber");

		const response: ApiResponse = {
			status: true,
			message: "Billing created successfully",
			data: billing
		};

		res.status(201).json(response);
	} catch (error: any) {
		console.error("Create billing error:", error);

		// Handle mongoose validation errors
		if (error.name === "ValidationError") {
			const response: ApiResponse = {
				status: false,
				message:
					(Object.values(error.errors)[0] as any)?.message ||
					"Validation error",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		const response: ApiResponse = {
			status: false,
			message: "Failed to create billing",
			data: null
		};
		res.status(500).json(response);
	}
};

// Get all billings for a user with search, filter, and pagination
export const getBillings = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const {
			searchQuery,
			companyName,
			vehicleId,
			dateFrom,
			dateTo,
			isCompleted,
			page,
			limit
		}: BillingSearchFilters = req.query;

		if (!userId) {
			const response: ApiResponse = {
				status: false,
				message: "User authentication required",
				data: null
			};
			res.status(401).json(response);
			return;
		}

		const pageStr = String(page || "1");
		const limitStr = String(limit || "10");
		const pageNum = Math.max(1, parseInt(pageStr) || 1);
		const limitNum = Math.min(50, Math.max(1, parseInt(limitStr) || 10));

		// Build filters
		const filters: any = {};
		if (searchQuery) filters.searchQuery = searchQuery;
		if (companyName) filters.companyName = companyName;
		if (vehicleId) filters.vehicleId = vehicleId;
		if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
		if (dateTo) filters.dateTo = new Date(dateTo as string);
		if (isCompleted !== undefined)
			filters.isCompleted = String(isCompleted) === "true";

		const result = await (Billing as any).findByUserWithFilters(
			userId,
			filters,
			pageNum,
			limitNum
		);

		const response: ApiResponse<BillingPaginationResponse> = {
			status: true,
			message:
				result.bills.length > 0
					? "Billings retrieved successfully"
					: "No billings found",
			data: result
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Get billings error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to retrieve billings",
			data: null
		};
		res.status(500).json(response);
	}
};

// Get a single billing by ID
export const getBillingById = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?._id;

		if (!userId) {
			const response: ApiResponse = {
				status: false,
				message: "User authentication required",
				data: null
			};
			res.status(401).json(response);
			return;
		}

		const billing = await Billing.findOne({ _id: id, userId }).populate(
			"vehicleId",
			"vehicleNumber"
		);

		if (!billing) {
			const response: ApiResponse = {
				status: false,
				message: "Billing not found",
				data: null
			};
			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			message: "Billing retrieved successfully",
			data: billing
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Get billing by ID error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to retrieve billing",
			data: null
		};
		res.status(500).json(response);
	}
};

// Update a billing
export const updateBilling = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const updateData: UpdateBillingRequest = req.body;
		const userId = req.user?._id;

		if (!userId) {
			const response: ApiResponse = {
				status: false,
				message: "User authentication required",
				data: null
			};
			res.status(401).json(response);
			return;
		}

		// If vehicleId is being updated, verify it belongs to the user
		if (updateData.vehicleId) {
			const vehicle = await Vehicle.findOne({
				_id: updateData.vehicleId,
				userId
			});
			if (!vehicle) {
				const response: ApiResponse = {
					status: false,
					message: "Vehicle not found or doesn't belong to user",
					data: null
				};
				res.status(404).json(response);
				return;
			}
		}

		// Validate numeric fields if provided
		if (updateData.quantity !== undefined && updateData.quantity <= 0) {
			const response: ApiResponse = {
				status: false,
				message: "Quantity must be greater than 0",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		if (updateData.rate !== undefined && updateData.rate <= 0) {
			const response: ApiResponse = {
				status: false,
				message: "Rate must be greater than 0",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		// Clean string fields
		const cleanedData: any = { ...updateData };
		if (cleanedData.companyName)
			cleanedData.companyName = cleanedData.companyName.trim();
		if (cleanedData.recipientName)
			cleanedData.recipientName = cleanedData.recipientName.trim();
		if (cleanedData.recipientAddress)
			cleanedData.recipientAddress = cleanedData.recipientAddress.trim();
		if (cleanedData.workingTime)
			cleanedData.workingTime = cleanedData.workingTime.trim();
		if (cleanedData.hsnCode) cleanedData.hsnCode = cleanedData.hsnCode.trim();
		if (cleanedData.billingDate)
			cleanedData.billingDate = new Date(cleanedData.billingDate);

		const billing = await Billing.findOneAndUpdate(
			{ _id: id, userId },
			cleanedData,
			{ new: true, runValidators: true }
		).populate("vehicleId", "vehicleNumber");

		if (!billing) {
			const response: ApiResponse = {
				status: false,
				message: "Billing not found",
				data: null
			};
			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			message: "Billing updated successfully",
			data: billing
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Update billing error:", error);

		// Handle mongoose validation errors
		if (error.name === "ValidationError") {
			const response: ApiResponse = {
				status: false,
				message:
					(Object.values(error.errors)[0] as any)?.message ||
					"Validation error",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		const response: ApiResponse = {
			status: false,
			message: "Failed to update billing",
			data: null
		};
		res.status(500).json(response);
	}
};

// Delete a billing
export const deleteBilling = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const userId = req.user?._id;

		if (!userId) {
			const response: ApiResponse = {
				status: false,
				message: "User authentication required",
				data: null
			};
			res.status(401).json(response);
			return;
		}

		const billing = await Billing.findOneAndDelete({
			_id: id,
			userId,
			isCompleted: true
		}).populate("vehicleId", "vehicleNumber");

		if (!billing) {
			const response: ApiResponse = {
				status: false,
				message: "Billing not found or not completed",
				data: null
			};
			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			message: "Billing deleted successfully",
			data: billing
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Delete billing error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to delete billing",
			data: null
		};
		res.status(500).json(response);
	}
};

// Get billing statistics for dashboard
export const getBillingStats = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;

		if (!userId) {
			const response: ApiResponse = {
				status: false,
				message: "User authentication required",
				data: null
			};
			res.status(401).json(response);
			return;
		}

		const stats = await (Billing as any).getBillingStats(userId);

		const response: ApiResponse<BillingStatsResponse> = {
			status: true,
			message: "Billing statistics retrieved successfully",
			data: stats
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Get billing stats error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to retrieve billing statistics",
			data: null
		};
		res.status(500).json(response);
	}
};

// Calculate billing amounts (utility endpoint for real-time calculations)
export const calculateBilling = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { quantity = 1, rate }: { quantity?: number; rate: number } =
			req.body;

		if (!rate || rate <= 0) {
			const response: ApiResponse = {
				status: false,
				message: "Valid rate is required",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		if (quantity <= 0) {
			const response: ApiResponse = {
				status: false,
				message: "Quantity must be greater than 0",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		const calculation = calculateBillingAmounts(quantity, rate);

		const response: ApiResponse<BillingCalculation> = {
			status: true,
			message: "Billing calculation completed",
			data: calculation
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Calculate billing error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to calculate billing",
			data: null
		};
		res.status(500).json(response);
	}
};
