import { Router, RequestHandler } from "express";
import { 
  createSettings, 
  getSettings, 
  updateSettings, 
  deleteSettings 
} from "../controllers/settings.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth as RequestHandler, createSettings as RequestHandler);
router.get("/", requireAuth as RequestHandler, getSettings as RequestHandler);
router.put("/", requireAuth as RequestHandler, updateSettings as RequestHandler);
router.delete("/", requireAuth as RequestHandler, deleteSettings as RequestHandler);

export default router;