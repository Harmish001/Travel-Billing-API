import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import connectDB from "./config/db";
import "./config/passport"; // Initialize passport strategies
import authRoutes from "./routes/auth";
import vehicleRoutes from "./routes/vehicle.routes";
import billingRoutes from "./routes/billing.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize Passport
app.use(passport.initialize());

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/billings", billingRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Product Management Server is running!",
    data: {
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: true,
    message: "Server is healthy",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: false,
    message: "Route not found",
    data: null,
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global error:", err);
  res.status(500).json({
    status: false,
    message: "Internal server error",
    data:
      process.env.NODE_ENV === "development" ? { error: err.message } : null,
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});
