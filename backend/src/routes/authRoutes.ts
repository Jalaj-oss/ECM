import { Router } from "express";
import { register, login } from "../controllers/authControllers.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {authorize} from "../middleware/roleMiddleware.js"

const router = Router();
router.post("/register",register)
router.post("/login",login)

router.get("/me",authenticate,(req,res)=>{
    res.json({
        message:"Authentication successful",
        user:req.user,
    })
})
router.get(
    "/admin-test",
    authenticate,
    authorize("admin"),
    (req,res)=>{
        res.json({
            message:"Admin access granted",
            user:req.user,
        })
    }
)
export default router