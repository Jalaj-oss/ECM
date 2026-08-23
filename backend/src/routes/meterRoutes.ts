import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  getMeters,
  getMeterById,
  createMeter,
  updateMeter,
  deleteMeter,
} from "../controllers/meterController.js"

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getMeters
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getMeterById
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createMeter
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateMeter
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteMeter
);

export default router;