import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
} from "../controllers/billController.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), getBills);
router.get("/:id", authenticate, authorize("admin"), getBillById);
router.post("/", authenticate, authorize("admin"), createBill);
router.put("/:id", authenticate, authorize("admin"), updateBill);
router.delete("/:id", authenticate, authorize("admin"), deleteBill);

export default router;
