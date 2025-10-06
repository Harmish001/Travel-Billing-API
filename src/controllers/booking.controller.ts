import { Request, Response } from "express";
import Booking from "../models/Booking";
import { ApiResponse } from "../types";
import { CreateBookingRequest, BookingInterface } from "../types/booking";
import dayjs from "dayjs";

export const createBooking = async (req: Request, res: Response) => {
	try {
		const bookingData = req.body as CreateBookingRequest;

		const newBooking = new Booking(bookingData);

		const savedBooking = await newBooking.save();

		const response: ApiResponse<BookingInterface> = {
			status: true,
			message: "Booking created successfully",
			data: savedBooking
		};

		res.status(201).json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error creating booking",
			data: null
		};
		res.status(500).json(response);
	}
};

export const getAllBookings = async (req: Request, res: Response) => {
	try {
		const bookings = await Booking.find({});

		const response: ApiResponse<BookingInterface[]> = {
			status: true,
			message: "Bookings retrieved successfully",
			data: bookings
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error retrieving bookings",
			data: null
		};
		res.status(500).json(response);
	}
};

export const getDaywiseBookings = async (req: Request, res: Response) => {
	try {
		const { date } = req.params;

		// Use Day.js for date operations
		const startDate = dayjs(date).startOf("day").toDate();
		const endDate = dayjs(date).endOf("day").toDate();

		const bookings = await Booking.find({
			date: {
				$gte: startDate,
				$lte: endDate
			}
		});

		const response: ApiResponse<BookingInterface[]> = {
			status: true,
			message: "Daywise bookings retrieved successfully",
			data: bookings
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error retrieving daywise bookings",
			data: null
		};
		res.status(500).json(response);
	}
};

export const getMonthwiseBookings = async (req: Request, res: Response) => {
	try {
		const { monthYear } = req.params;

		// Parse the month-year string (format: MM-YYYY)
		const [month, year] = monthYear.split("-").map(Number);

		// Validate month and year
		if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
			const response: ApiResponse = {
				status: false,
				message:
					"Invalid month or year format. Please use MM-YYYY format (e.g., 10-2025 for October 2025).",
				data: null
			};
			return res.status(400).json(response);
		}

		// Use Day.js for date operations
		const startDate = dayjs()
			.year(year)
			.month(month - 1)
			.startOf("month")
			.toDate();
		const endDate = dayjs()
			.year(year)
			.month(month - 1)
			.endOf("month")
			.toDate();

		const bookings = await Booking.find({
			date: {
				$gte: startDate,
				$lte: endDate
			}
		});

		const response: ApiResponse<BookingInterface[]> = {
			status: true,
			message: `Bookings for ${month}-${year} retrieved successfully`,
			data: bookings
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error retrieving monthwise bookings",
			data: null
		};
		res.status(500).json(response);
	}
};
