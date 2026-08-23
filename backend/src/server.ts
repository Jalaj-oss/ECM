import express from "express";
import cors from "cors";
import pool from "./config/Database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import meterRoutes from "./routes/meterRoutes.js"

const app =express()

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes)
app.get("/api/health",async(req, res)=>{
    try{
        await pool.query("SELECT 1")
    res.json({
        message :"EHMS backend is running",
          database: "MySQL connected",
})
}catch (error) {
    console.error("Database connection error:", error)

    res.status(500).json({
      message: "Database connection failed",
    })
  }
})
app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/meters", meterRoutes);

const PORT=5000

app.listen(PORT,()=>{
    console.log(`server running on http://localhost:${PORT}`)
})