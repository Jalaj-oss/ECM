import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { getReportSummary } from "../controllers/reportController.js";

const router = Router();

router.get(
  "/summary",
  authenticate,
  authorize("admin"),
  getReportSummary
);

export default router;
