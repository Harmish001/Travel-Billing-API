import { Router, RequestHandler } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
  getVehicleTypes,
} from "../controllers/vehicle.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth as RequestHandler);

// Routes

/**
 * @route   POST /api/vehicles
 * @desc    Create a new vehicle
 * @access  Private
 */
router.post("/", createVehicle as RequestHandler);

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles for the authenticated user with search and pagination
 * @access  Private
 * @query   search - Search term for vehicle number (optional)
 * @query   page - Page number for pagination (optional, default: 1)
 * @query   limit - Number of items per page (optional, default: 10, max: 50)
 */
router.get("/", getVehicles as RequestHandler);

/**
 * @route   GET /api/vehicles/stats
 * @desc    Get vehicle statistics for dashboard
 * @access  Private
 */
router.get("/stats", getVehicleStats as RequestHandler);

/**
 * @route   GET /api/vehicles/types
 * @desc    Get all available vehicle types
 * @access  Private
 */
router.get("/types", getVehicleTypes as RequestHandler);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get a single vehicle by ID
 * @access  Private
 */
router.get("/:id", getVehicleById as RequestHandler);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update a vehicle
 * @access  Private
 */
router.put("/:id", updateVehicle as RequestHandler);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete a vehicle
 * @access  Private
 */
router.delete("/:id", deleteVehicle as RequestHandler);

export default router;
