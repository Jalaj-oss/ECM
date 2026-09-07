import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  getAllComplaintsAdmin,
  getComplaintByIdAdmin,
  updateComplaintStatusAdmin,
  deleteComplaintAdmin,
} from "../controllers/complaintController.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), getAllComplaintsAdmin);
router.get("/:id", authenticate, authorize("admin"), getComplaintByIdAdmin);
router.put("/:id", authenticate, authorize("admin"), updateComplaintStatusAdmin);
router.delete("/:id", authenticate, authorize("admin"), deleteComplaintAdmin);

export default router;
