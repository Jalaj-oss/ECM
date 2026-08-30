import express from "express";
import cors from "cors";
import pool from "./config/Database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import meterRoutes from "./routes/meterRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userDashboardRoutes from "./routes/userDashboardRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import userOnlinePaymentRoutes from "./routes/userOnlinePaymentRoutes.js";
import { handleStripeWebhook } from "./controllers/userOnlinePaymentController.js";

const app = express();

app.use(cors());

app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      message: "EHMS backend is running",
      database: "MySQL connected",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meters", meterRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);

// Specific online payment routes MUST come before generic dashboard routes
app.use("/api/user", userOnlinePaymentRoutes);
app.use("/api/user", userDashboardRoutes);
app.use("/api/register", registerRoutes);

export default app;