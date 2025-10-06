import { Response } from "express";
import Driver from "../models/Driver";
import { ApiResponse } from "../types";
import { AuthRequest } from "../middleware/auth";
import {
	CreateDriverRequest,
	DriverInterface,
	UpdateDriverRequest
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
		const drivers = await Driver.find({ userId });

		const response: ApiResponse<DriverInterface[]> = {
			status: true,
			message: "Drivers retrieved successfully",
			data: drivers
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
