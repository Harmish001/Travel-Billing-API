import { Request, Response } from "express";
import Billing from "../models/Billing";
import Vehicle from "../models/Vehicle";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
// import { PDFService } from "../utils/pdf.service";
// import { ExcelService } from "../utils/excel.service.simple";
import { ApiResponse } from "../types";
import { BillingCalculation, BillingPaginationResponse, BillingSearchFilters, BillingStatsResponse, CreateBillingRequest, UpdateBillingRequest, BillingItem, BankDetails } from "../types/billing";

// Helper function to calculate billing amounts for a single item
const calculateBillingItemAmounts = (
	quantity: number,
	rate: number
): { totalAmount: number } => {
	const totalAmount = Number((quantity * rate).toFixed(2));
	return { totalAmount };
};

// Helper function to calculate total invoice value from billing items
const calculateTotalInvoiceValue = (billingItems: BillingItem[]): number => {
	return Number(billingItems.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2));
};

// Create a new billing
export const createBilling = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const {
			companyName,
			vehicleIds,
			billingDate,
			recipientName,
			recipientAddress,
			workingTime,
			period,
			projectLocation,
			placeOfSupply,
			billingItems,
			bankDetails
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
		console.log(req.body)
		if (
			!companyName ||
			(!vehicleIds || vehicleIds.length === 0) ||
			!recipientName ||
			!recipientAddress ||
			!workingTime ||
			!period ||
			!projectLocation ||
			!placeOfSupply ||
			!billingItems || 
			billingItems.length === 0 ||
			!bankDetails
		) {
			const response: ApiResponse = {
				status: false,
				message: "All required fields must be provided",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		// Validate billing items
		for (const item of billingItems) {
			if (!item.description || !item.hsnSac || !item.unit || item.quantity <= 0 || item.rate <= 0) {
				const response: ApiResponse = {
					status: false,
					message: "All billing item fields must be valid",
					data: null
				};
				res.status(400).json(response);
				return;
			}
			
			// Calculate total amount for each item
			const { totalAmount } = calculateBillingItemAmounts(item.quantity, item.rate);
			item.totalAmount = totalAmount;
		}

		// Validate bank details
		if (!bankDetails.bankName || !bankDetails.branch || !bankDetails.accountNumber || !bankDetails.ifscCode) {
			const response: ApiResponse = {
				status: false,
				message: "All bank details must be provided",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		// Verify that all vehicles belong to the user
		const vehicles = await Vehicle.find({ 
			_id: { $in: vehicleIds }, 
			userId 
		});
		
		if (vehicles.length !== vehicleIds.length) {
			const response: ApiResponse = {
				status: false,
				message: "One or more vehicles not found or don't belong to user",
				data: null
			};
			res.status(404).json(response);
			return;
		}

		// Calculate total invoice value
		const totalInvoiceValue = calculateTotalInvoiceValue(billingItems);

		// Create billing with support for multiple vehicles and billing items
		const billingData: any = {
			userId,
			companyName: companyName.trim(),
			billingDate: billingDate ? new Date(billingDate) : new Date(),
			recipientName: recipientName.trim(),
			recipientAddress: recipientAddress.trim(),
			workingTime: workingTime.trim(),
			period: period.trim(),
			projectLocation: projectLocation.trim(),
			placeOfSupply: placeOfSupply.trim(),
			billingItems,
			bankDetails,
			totalInvoiceValue,
			isCompleted: true
		};

		// Set vehicleIds (multiple)
		billingData.vehicleIds = vehicleIds;

		const billing = await Billing.create(billingData);

		// Populate vehicle information
		await billing.populate("vehicleIds", "vehicleNumber");

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
			"vehicleIds",
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

		// If vehicleIds is being updated, verify all vehicles belong to the user
		if (updateData.vehicleIds && updateData.vehicleIds.length > 0) {
			const vehicles = await Vehicle.find({ 
				_id: { $in: updateData.vehicleIds }, 
				userId 
			});
			
			if (vehicles.length !== updateData.vehicleIds.length) {
				const response: ApiResponse = {
					status: false,
					message: "One or more vehicles not found or don't belong to user",
					data: null
				};
				res.status(404).json(response);
				return;
			}
		}

		// Validate billing items if provided
		if (updateData.billingItems && updateData.billingItems.length > 0) {
			for (const item of updateData.billingItems) {
				if (item.quantity !== undefined && item.quantity <= 0) {
					const response: ApiResponse = {
						status: false,
						message: "Quantity must be greater than 0",
						data: null
					};
					res.status(400).json(response);
					return;
				}

				if (item.rate !== undefined && item.rate <= 0) {
					const response: ApiResponse = {
						status: false,
						message: "Rate must be greater than 0",
						data: null
					};
					res.status(400).json(response);
					return;
				}
				
				// Recalculate total amount if quantity or rate is updated
				if (item.quantity !== undefined || item.rate !== undefined) {
					const quantity = item.quantity || 1;
					const rate = item.rate || 0;
					const { totalAmount } = calculateBillingItemAmounts(quantity, rate);
					item.totalAmount = totalAmount;
				}
			}
			
			// Recalculate total invoice value
			if (updateData.billingItems) {
				updateData.totalInvoiceValue = calculateTotalInvoiceValue(updateData.billingItems);
			}
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
		if (cleanedData.period)
			cleanedData.period = cleanedData.period.trim();
		if (cleanedData.projectLocation)
			cleanedData.projectLocation = cleanedData.projectLocation.trim();
		if (cleanedData.placeOfSupply)
			cleanedData.placeOfSupply = cleanedData.placeOfSupply.trim();
		if (cleanedData.billingDate)
			cleanedData.billingDate = new Date(cleanedData.billingDate);

		const billing = await Billing.findOneAndUpdate(
			{ _id: id, userId },
			cleanedData,
			{ new: true, runValidators: true }
		).populate("vehicleIds", "vehicleNumber");

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
		}).populate("vehicleIds", "vehicleNumber");

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

		const { totalAmount } = calculateBillingItemAmounts(quantity, rate);

		const response: ApiResponse<{ totalAmount: number }> = {
			status: true,
			message: "Billing calculation completed",
			data: { totalAmount }
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