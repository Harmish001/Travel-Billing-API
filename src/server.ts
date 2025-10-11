import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import connectDB from "./config/db";
import "./config/passport";
import "./utils/helpers";
import registerdRoutes from "./routes";

// Import Node.js built-in modules for memory monitoring
import os from "os";
import process from "process";

// Import memory cleanup utility
import { startMemoryMonitoring } from "./utils/memory.cleanup";

dotenv.config();

// Memory monitoring function
const logMemoryUsage = () => {
	const usage = process.memoryUsage();
	const usageMB = {
		rss: Math.round((usage.rss / 1024 / 1024) * 100) / 100,
		heapTotal: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100,
		heapUsed: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100,
		external: Math.round((usage.external / 1024 / 1024) * 100) / 100
	};
	console.log("Memory Usage (MB):", usageMB);
};

// Start memory monitoring
startMemoryMonitoring(60000); // Check every minute

// Log memory usage every 30 seconds in development
if (process.env.NODE_ENV !== "production") {
	setInterval(logMemoryUsage, 30000);
}

const app: Express = express();
const port = process.env.PORT || 4000;

// Configure CORS with dynamic origin checking
const corsOptions = {
	origin: function (
		origin: string | undefined,
		callback: (err: Error | null, allow?: boolean) => void
	) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		// List of allowed origins
		const allowedOrigins = [
			process.env.FRONTEND_URL,
			"http://localhost:3000",
			"https://saitravels.vercel.app"
		].filter((url): url is string => url !== undefined); // Type guard to filter out undefined values

		// Check if the origin is in our allowed list or if we're in development
		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: [
		"Origin",
		"X-Requested-With",
		"Content-Type",
		"Accept",
		"Authorization"
	],
	exposedHeaders: ["Content-Range", "X-Content-Range"]
};

// Middleware
app.use(cors(corsOptions));

// Explicitly handle preflight requests for all routes
app.options("*", cors(corsOptions));
// Reduced payload limits to prevent memory issues
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Compression middleware to reduce response size
app.use((req, res, next) => {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	res.setHeader("Pragma", "no-cache");
	res.setHeader("Expires", "0");
	next();
});

// Set timeout to prevent hanging requests
app.use((req, res, next) => {
	// Reduce timeout to 15 seconds to prevent memory buildup
	req.setTimeout(15000, () => {
		if (!res.headersSent) {
			res.status(408).json({
				status: false,
				message: "Request Timeout",
				data: null
			});
		}
	});
	res.setTimeout(15000, () => {
		if (!res.headersSent) {
			res.status(408).json({
				status: false,
				message: "Response Timeout",
				data: null
			});
		}
	});
	next();
});

// Initialize Passport
app.use(passport.initialize());

// Connect to Database
connectDB();

// Register routes before starting server
const router = registerdRoutes(app);
app.use("/api", router);

// Basic route
app.get("/", (req, res) => {
	res.json({
		status: true,
		message: "Product Management Server is running!",
		data: {
			version: "1.0.0",
			environment: process.env.NODE_ENV || "development"
		}
	});
});

// Health check endpoint
app.get("/health", (req, res) => {
	const memoryUsage = process.memoryUsage();
	const healthData = {
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		memory: {
			rss: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
			heapTotal: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
			heapUsed: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
			external: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100
		},
		environment: process.env.NODE_ENV || "development",
		nodeVersion: process.version
	};

	res.status(200).json({
		status: true,
		message: "Server is healthy",
		data: healthData
	});
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
	console.error("Global error:", err);
	res.status(500).json({
		status: false,
		message: "Internal server error",
		data: process.env.NODE_ENV === "development" ? { error: err.message } : null
	});
});

// Start server
app.listen(port, () => {
	console.log(`🚀 Server is running on port ${port}`);
	console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
	console.log(`🔗 Health check: http://localhost:${port}/health`);
});
