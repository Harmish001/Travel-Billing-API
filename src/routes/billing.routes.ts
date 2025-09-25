import { Router, RequestHandler } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createBilling,
  getBillings,
  getBillingById,
  updateBilling,
  deleteBilling,
  getBillingStats,
  calculateBilling,
} from "../controllers/billing.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth as RequestHandler);

// Routes

/**
 * @route   POST /api/billings
 * @desc    Create a new billing
 * @access  Private
 */
router.post("/", createBilling as RequestHandler);

/**
 * @route   GET /api/billings
 * @desc    Get all billings for the authenticated user with search, filter, and pagination
 * @access  Private
 */
router.get("/", getBillings as RequestHandler);

/**
 * @route   GET /api/billings/stats
 * @desc    Get billing statistics for dashboard
 * @access  Private
 */
router.get("/stats", getBillingStats as RequestHandler);

/**
 * @route   POST /api/billings/calculate
 * @desc    Calculate billing amounts (utility endpoint for real-time calculations)
 * @access  Private
 */
router.post("/calculate", calculateBilling as RequestHandler);

/**
 * @route   GET /api/billings/:id
 * @desc    Get a single billing by ID
 * @access  Private
 */
router.get("/:id", getBillingById as RequestHandler);

/**
 * @route   PUT /api/billings/:id
 * @desc    Update a billing
 * @access  Private
 */
router.put("/:id", updateBilling as RequestHandler);

/**
 * @route   DELETE /api/billings/:id
 * @desc    Delete a billing (only completed bills)
 * @access  Private
 */
router.delete("/:id", deleteBilling as RequestHandler);

export default router;