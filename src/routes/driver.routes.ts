import { Router, RequestHandler } from "express";
import {
	createDriver,
	getDriver,
	getAllDrivers,
	updateDriver,
	deleteDriver
} from "../controllers/driver.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth as RequestHandler, createDriver as RequestHandler);
router.get("/", requireAuth as RequestHandler, getAllDrivers as RequestHandler);
router.get("/:id", requireAuth as RequestHandler, getDriver as RequestHandler);
router.put(
	"/:id",
	requireAuth as RequestHandler,
	updateDriver as RequestHandler
);
router.delete(
	"/:id",
	requireAuth as RequestHandler,
	deleteDriver as RequestHandler
);

export default router;
