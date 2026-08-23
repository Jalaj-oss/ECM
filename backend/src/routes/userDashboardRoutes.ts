import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getUserDashboard, getUserProfile, getUserMeters,
  getUserBills, getUserBillById, getUserPayments, getUserPaymentById
} from "../controllers/userDashboardController.js";

const router = Router();

router.get("/dashboard", authenticate, getUserDashboard);
router.get("/profile", authenticate, getUserProfile);
router.get("/meters", authenticate, getUserMeters);
router.get("/bills", authenticate, getUserBills);
router.get("/bills/:id", authenticate, getUserBillById);
router.get("/payments", authenticate, getUserPayments);
router.get("/payments/:id", authenticate, getUserPaymentById);

export default router;
