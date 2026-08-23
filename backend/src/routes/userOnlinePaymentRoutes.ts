import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createBillCheckoutSession,
} from "../controllers/userOnlinePaymentController.js";

const router = Router();

router.post(
  "/bills/:id/checkout",
  authenticate,
  createBillCheckoutSession
);

export default router;
