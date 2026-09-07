import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createComplaint,
  getUserComplaints,
  getUserComplaintById,
} from "../controllers/complaintController.js";

const router = Router();

router.post("/", authenticate, createComplaint);
router.get("/", authenticate, getUserComplaints);
router.get("/:id", authenticate, getUserComplaintById);

export default router;
