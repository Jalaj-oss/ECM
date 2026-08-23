import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), getPayments);
router.get("/:id", authenticate, authorize("admin"), getPaymentById);
router.post("/", authenticate, authorize("admin"), createPayment);
router.put("/:id", authenticate, authorize("admin"), updatePayment);
router.delete("/:id", authenticate, authorize("admin"), deletePayment);

export default router;
