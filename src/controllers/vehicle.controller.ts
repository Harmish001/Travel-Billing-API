import Vehicle from "../models/Vehicle";
import { AuthRequest } from "../middleware/auth";
import { ApiResponse } from "../types";
import { CreateVehicleRequest, UpdateVehicleRequest } from "../types/vehicle";
import { Response } from "express";

// Create a new vehicle
export const createVehicle = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { vehicleNumber, vehicleType } = req.body as CreateVehicleRequest;
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

		if (!vehicleNumber || !vehicleNumber.trim()) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle number is required",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		if (!vehicleType) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle type is required",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		const existingVehicle = await Vehicle.findOne({
			userId,
			vehicleNumber: vehicleNumber.trim().toUpperCase()
		});

		if (existingVehicle) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle number already exists",
				data: null
			};
			res.status(409).json(response);
			return;
		}

		const vehicle = await Vehicle.create({
			userId,
			vehicleNumber: vehicleNumber.trim(),
			vehicleType
		});

		const response: ApiResponse = {
			status: true,
			message: "Vehicle created successfully",
			data: vehicle
		};

		res.status(201).json(response);
	} catch (error: any) {
		console.error("Create vehicle error:", error);

		// Handle duplicate key error
		if (error.code === 11000) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle number already exists",
				data: null
			};
			res.status(409).json(response);
			return;
		}

		const response: ApiResponse = {
			status: false,
			message: "Failed to create vehicle",
			data: null
		};
		res.status(500).json(response);
	}
};

// Get all vehicles for a user with search and pagination
export const getVehicles = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const userId = req.user?._id;
		const search = req.query.search as string;
		const pageQuery = req.query.page as string;
		const limitQuery = req.query.limit as string;

		if (!userId) {
			const response: ApiResponse = {
				status: false,
				message: "User authentication required",
				data: null
			};
			res.status(401).json(response);
			return;
		}

		const page = Math.max(1, parseInt(pageQuery) || 1);
		const limit = Math.min(50, Math.max(1, parseInt(limitQuery) || 10));

		const result = await (Vehicle as any).findByUserWithSearch(
			userId,
			search,
			page,
			limit
		);

		const response: ApiResponse = {
			status: true,
			message:
				result.vehicles.length > 0
					? "Vehicles retrieved successfully"
					: "No vehicles found",
			data: result
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Get vehicles error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to retrieve vehicles",
			data: null
		};
		res.status(500).json(response);
	}
};

// Get a single vehicle by ID
export const getVehicleById = async (
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

		const vehicle = await Vehicle.findOne({ _id: id, userId });

		if (!vehicle) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle not found",
				data: null
			};
			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			message: "Vehicle retrieved successfully",
			data: vehicle
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Get vehicle by ID error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to retrieve vehicle",
			data: null
		};
		res.status(500).json(response);
	}
};

// Update a vehicle
export const updateVehicle = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;
		const { vehicleNumber, vehicleType } = req.body as UpdateVehicleRequest;
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

		const updateData: any = {};

		if (vehicleNumber !== undefined) {
			if (!vehicleNumber.trim()) {
				const response: ApiResponse = {
					status: false,
					message: "Vehicle number cannot be empty",
					data: null
				};
				res.status(400).json(response);
				return;
			}

			const existingVehicle = await Vehicle.findOne({
				userId,
				vehicleNumber: vehicleNumber.trim().toUpperCase(),
				_id: { $ne: id }
			});

			if (existingVehicle) {
				const response: ApiResponse = {
					status: false,
					message: "Vehicle number already exists",
					data: null
				};
				res.status(409).json(response);
				return;
			}

			updateData.vehicleNumber = vehicleNumber.trim();
		}

		if (vehicleType !== undefined) {
			updateData.vehicleType = vehicleType;
		}

		if (Object.keys(updateData).length === 0) {
			const response: ApiResponse = {
				status: false,
				message: "No valid fields provided for update",
				data: null
			};
			res.status(400).json(response);
			return;
		}

		const vehicle = await Vehicle.findOneAndUpdate(
			{ _id: id, userId },
			updateData,
			{ new: true, runValidators: true }
		);

		if (!vehicle) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle not found",
				data: null
			};
			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			message: "Vehicle updated successfully",
			data: vehicle
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Update vehicle error:", error);

		// Handle duplicate key error
		if (error.code === 11000) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle number already exists",
				data: null
			};
			res.status(409).json(response);
			return;
		}

		const response: ApiResponse = {
			status: false,
			message: "Failed to update vehicle",
			data: null
		};
		res.status(500).json(response);
	}
};

// Delete a vehicle
export const deleteVehicle = async (
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

		const vehicle = await Vehicle.findOneAndDelete({ _id: id, userId });

		if (!vehicle) {
			const response: ApiResponse = {
				status: false,
				message: "Vehicle not found",
				data: null
			};
			res.status(404).json(response);
			return;
		}

		const response: ApiResponse = {
			status: true,
			message: "Vehicle deleted successfully",
			data: vehicle
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Delete vehicle error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to delete vehicle",
			data: null
		};
		res.status(500).json(response);
	}
};

// Get vehicle statistics for dashboard
export const getVehicleStats = async (
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

		const totalVehicles = await Vehicle.countDocuments({ userId });
		const recentVehicles = await Vehicle.find({ userId })
			.sort({ createdAt: -1 })
			.limit(5)
			.lean();

		const stats = {
			totalVehicles,
			recentVehicles
		};

		const response: ApiResponse = {
			status: true,
			message: "Vehicle statistics retrieved successfully",
			data: stats
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Get vehicle stats error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to retrieve vehicle statistics",
			data: null
		};
		res.status(500).json(response);
	}
};

export const getVehicleTypes = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const vehicleTypes = [
			"Car",
			"Truck",
			"Van",
			"Bus",
			"Motorcycle",
			"Auto Rickshaw",
			"Tempo Traveller",
			"Trailer",
			"Other"
		];

		const response: ApiResponse = {
			status: true,
			message: "Vehicle types retrieved successfully",
			data: vehicleTypes
		};

		res.status(200).json(response);
	} catch (error: any) {
		console.error("Get vehicle types error:", error);
		const response: ApiResponse = {
			status: false,
			message: "Failed to retrieve vehicle types",
			data: null
		};
		res.status(500).json(response);
	}
};
