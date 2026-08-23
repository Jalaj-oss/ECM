import { Router } from "express";
import { registerUser } from "../controllers/registerController.js";

const router = Router();

router.post("/", registerUser);

export default router;
