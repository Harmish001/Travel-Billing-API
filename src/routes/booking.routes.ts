import { Router, RequestHandler } from "express";
import {
	createBooking,
	getAllBookings,
	getRangewiseBookings, // Changed from getDaywiseBookings
	getMonthwiseBookings,
	updateBookingStatus
} from "../controllers/booking.controller";

const router = Router();

router.post("/", createBooking as RequestHandler);
router.get("/", getAllBookings as RequestHandler);
router.get("/range", getRangewiseBookings as RequestHandler); // Changed endpoint
router.get("/month/:monthYear", getMonthwiseBookings as RequestHandler);
router.patch("/:id/status", updateBookingStatus as RequestHandler); // New route for updating booking status

export default router;