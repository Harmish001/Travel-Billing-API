import { Application, Router } from "express";
import authRoutes from "../routes/auth";
import vehicleRoutes from "../routes/vehicle.routes";
import billingRoutes from "../routes/billing.routes";
import settingsRoutes from "../routes/settings.routes";
import driverRoutes from "../routes/driver.routes";
import bookingRoutes from "../routes/booking.routes";

const registerdRoutes = (app: Application) => {
	const router: Router = Router();
	router.use("/auth", authRoutes);
	router.use("/vehicles", vehicleRoutes);
	router.use("/billings", billingRoutes);
	router.use("/settings", settingsRoutes);
	router.use("/drivers", driverRoutes);
	router.use("/bookings", bookingRoutes);
	// Health check route
	router.get("/health", (req, res) => {
		res.json({
			status: true,
			message: "Server is healthy",
			data: {
				timestamp: new Date().toISOString(),
				uptime: process.uptime()
			}
		});
	});
	// 404 handler
	router.use("*", (req, res) => {
		res.status(404).json({
			status: false,
			message: "Route not found",
			data: null
		});
	});
	app.use("/api", router);
	return router;
};

export default registerdRoutes;
