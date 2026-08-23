import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { getUsers,getUserById,createUser,updateUser,deleteUser } from "../controllers/userControllers.js";
const router = Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getUsers
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getUserById
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createUser
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateUser
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteUser
);



export default router;