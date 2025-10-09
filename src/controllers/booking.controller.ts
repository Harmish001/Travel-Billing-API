import { Request, Response } from "express";
import Booking from "../models/Booking";
import { ApiResponse } from "../types";
import {
	CreateBookingRequest,
	BookingInterface,
	DateRangeQuery
} from "../types/booking";
import { sendBookingConfirmationEmail, sendBookingNotificationEmail } from "../utils/email.service";
import dayjs from "dayjs";

export const createBooking = async (req: Request, res: Response) => {
	try {
		const bookingData = req.body as CreateBookingRequest;

		const newBooking = new Booking(bookingData);

		const savedBooking = await newBooking.save();

		// Send email notifications if email is provided
		if (savedBooking.email) {
			// Send confirmation email to the user
			await sendBookingConfirmationEmail(savedBooking);
			
		}
		// Send notification email to admin
		await sendBookingNotificationEmail(savedBooking);

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

export const getRangewiseBookings = async (req: Request, res: Response) => {
	try {
		const {
			startDate,
			endDate,
			page = "1",
			limit = "10"
		} = req.query as DateRangeQuery;

		// Convert page and limit to numbers
		const pageNum = parseInt(page as string, 10);
		const limitNum = parseInt(limit as string, 10);
		const skip = (pageNum - 1) * limitNum;

		let start_date: Date;
		let end_date: Date;

		// If no dates provided, use current week's Monday to Sunday
		if (!startDate && !endDate) {
			// Get current week's Monday
			start_date = dayjs()
				.startOf("week")
				.add(1, "day")
				.startOf("day")
				.toDate();
			// Get current week's Sunday
			end_date = dayjs().endOf("week").add(1, "day").endOf("day").toDate();
		} else {
			// Use provided dates
			start_date = startDate
				? dayjs(startDate as string)
						.startOf("day")
						.toDate()
				: dayjs().startOf("week").add(1, "day").startOf("day").toDate();
			end_date = endDate
				? dayjs(endDate as string)
						.endOf("day")
						.toDate()
				: dayjs().endOf("week").add(1, "day").endOf("day").toDate();
		}

		// Find bookings within the date range
		const bookings = await Booking.find({
			date: {
				$gte: start_date,
				$lte: end_date
			}
		})
			.sort({ date: 1, time: 1 }) // Sort by date and time
			.skip(skip)
			.limit(limitNum);

		// Get total count for pagination
		const totalBookings = await Booking.countDocuments({
			date: {
				$gte: start_date,
				$lte: end_date
			}
		});

		const totalPages = Math.ceil(totalBookings / limitNum);

		const response: ApiResponse<{
			bookings: BookingInterface[];
			pagination: {
				currentPage: number;
				totalPages: number;
				totalBookings: number;
				hasNext: boolean;
				hasPrev: boolean;
			};
		}> = {
			status: true,
			message: "Rangewise bookings retrieved successfully",
			data: {
				bookings,
				pagination: {
					currentPage: pageNum,
					totalPages,
					totalBookings,
					hasNext: pageNum < totalPages,
					hasPrev: pageNum > 1
				}
			}
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error retrieving rangewise bookings",
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

export const updateBookingStatus = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		// Validate status value
		const validStatuses = ["Pending", "Completed", "inProgress"];
		if (!validStatuses.includes(status)) {
			const response: ApiResponse = {
				status: false,
				message:
					"Invalid status value. Must be one of: Pending, Completed, inProgress",
				data: null
			};
			return res.status(400).json(response);
		}

		// Find and update the booking status
		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{ status },
			{ new: true, runValidators: true }
		);

		if (!updatedBooking) {
			const response: ApiResponse = {
				status: false,
				message: "Booking not found",
				data: null
			};
			return res.status(404).json(response);
		}

		const response: ApiResponse<BookingInterface> = {
			status: true,
			message: "Booking status updated successfully",
			data: updatedBooking
		};

		res.json(response);
	} catch (error: any) {
		const response: ApiResponse = {
			status: false,
			message: error.message || "Error updating booking status",
			data: null
		};
		res.status(500).json(response);
	}
};
