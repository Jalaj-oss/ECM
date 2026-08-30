import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createBillCheckoutSession,
  verifyCheckoutSession,
} from "../controllers/userOnlinePaymentController.js";

const router = Router();

router.post(
  "/bills/:id/checkout",
  authenticate,
  createBillCheckoutSession
);

router.get(
  "/payments/verify-checkout",
  authenticate,
  verifyCheckoutSession
);

export default router;
