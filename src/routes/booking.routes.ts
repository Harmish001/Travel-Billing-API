import { Router, RequestHandler } from "express";
import {
	createBooking,
	getAllBookings,
	getDaywiseBookings,
	getMonthwiseBookings
} from "../controllers/booking.controller";

const router = Router();

router.post("/", createBooking as RequestHandler);
router.get("/", getAllBookings as RequestHandler);
router.get("/day/:date", getDaywiseBookings as RequestHandler);
router.get("/month/:monthYear", getMonthwiseBookings as RequestHandler);

export default router;