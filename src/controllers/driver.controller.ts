import { Response } from "express";
import Driver from "../models/Driver";
import { ApiResponse } from "../types";
import { AuthRequest } from "../middleware/auth";
import {
	CreateDriverRequest,
	DriverInterface,
	UpdateDriverRequest,
	PaginationQuery
} from "../types/driver";

export const createDriver = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user!._id;

		const driverData = req.body as CreateDriverRequest;

		const newDriver = new Driver({
			...driverData,
			userId
		});

		const savedDriver = await newDriver.save();

		const response: ApiResponse<DriverInterface> = {
			status: true,
			message: "Driver created successfully",
			data: savedDriver
		};

		res.status(201).json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error creating driver",
			data: null
		};
		res.status(500).json(response);
	}
};

export const getDriver = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user!._id;
		const { id } = req.params;

		const driver = await Driver.findOne({ _id: id, userId });

		if (!driver) {
			const response: ApiResponse = {
				status: false,
				message: "Driver not found",
				data: null
			};
			return res.status(404).json(response);
		}

		const response: ApiResponse<DriverInterface> = {
			status: true,
			message: "Driver retrieved successfully",
			data: driver
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error retrieving driver",
			data: null
		};
		res.status(500).json(response);
	}
};

export const getAllDrivers = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user!._id;
		const { page = "1", limit = "10" } = req.query as PaginationQuery;
		
		// Convert page and limit to numbers
		const pageNum = parseInt(page as string, 10);
		const limitNum = parseInt(limit as string, 10);
		const skip = (pageNum - 1) * limitNum;
		
		// Find drivers with pagination
		const drivers = await Driver.find({ userId })
			.sort({ createdAt: -1 }) // Sort by creation date, newest first
			.skip(skip)
			.limit(limitNum);
		
		// Get total count for pagination
		const totalDrivers = await Driver.countDocuments({ userId });
		
		const totalPages = Math.ceil(totalDrivers / limitNum);
		
		const response: ApiResponse<{
			drivers: DriverInterface[];
			pagination: {
				currentPage: number;
				totalPages: number;
				totalDrivers: number;
				hasNext: boolean;
				hasPrev: boolean;
			};
		}> = {
			status: true,
			message: "Drivers retrieved successfully",
			data: {
				drivers,
				pagination: {
					currentPage: pageNum,
					totalPages,
					totalDrivers,
					hasNext: pageNum < totalPages,
					hasPrev: pageNum > 1
				}
			}
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error retrieving drivers",
			data: null
		};
		res.status(500).json(response);
	}
};

export const updateDriver = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user!._id;
		const { id } = req.params;
		const updateData = req.body as UpdateDriverRequest;

		const updatedDriver = await Driver.findOneAndUpdate(
			{ _id: id, userId },
			updateData,
			{ new: true, runValidators: true }
		);

		if (!updatedDriver) {
			const response: ApiResponse = {
				status: false,
				message: "Driver not found",
				data: null
			};
			return res.status(404).json(response);
		}

		const response: ApiResponse<DriverInterface> = {
			status: true,
			message: "Driver updated successfully",
			data: updatedDriver
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error updating driver",
			data: null
		};
		res.status(500).json(response);
	}
};

export const deleteDriver = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.user!._id;
		const { id } = req.params;

		const deletedDriver = await Driver.findOneAndDelete({ _id: id, userId });

		if (!deletedDriver) {
			const response: ApiResponse = {
				status: false,
				message: "Driver not found",
				data: null
			};
			return res.status(404).json(response);
		}

		const response: ApiResponse = {
			status: true,
			message: "Driver deleted successfully",
			data: null
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error deleting driver",
			data: null
		};
		res.status(500).json(response);
	}
};
