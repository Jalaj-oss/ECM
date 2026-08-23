import type { Request, Response } from "express";
import pool from "../config/Database.js";

const userId = (req: Request) => Number((req as any).user?.id);

export const getUserDashboard = async (req: Request, res: Response) => {
  try {
    const id = userId(req);
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    const [users] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?", [id]
    );
    const userRows = users as any[];
    if (!userRows.length) return res.status(404).json({ message: "User not found" });

    const [meters] = await pool.query(
      `SELECT id, meter_number, meter_type, installation_date, status
       FROM meters WHERE user_id = ? ORDER BY id DESC`, [id]
    );
    const [bills] = await pool.query(
      `SELECT id, meter_id, billing_month, previous_reading, current_reading,
              units_consumed, amount, due_date, status
       FROM bills WHERE user_id = ? ORDER BY id DESC`, [id]
    );
    const [payments] = await pool.query(
      `SELECT id, bill_id, amount, payment_date, payment_method,
              transaction_id, status
       FROM payments WHERE user_id = ? ORDER BY id DESC`, [id]
    );

    return res.json({ user: userRows[0], meters, bills, payments });
  } catch (error) {
    console.error("Get user dashboard error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const id = userId(req);
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?", [id]
    );
    const users = rows as any[];
    if (!users.length) return res.status(404).json({ message: "User not found" });
    return res.json({ user: users[0] });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserMeters = async (req: Request, res: Response) => {
  try {
    const [meters] = await pool.query(
      `SELECT id, meter_number, meter_type, installation_date, status
       FROM meters WHERE user_id = ? ORDER BY id DESC`, [userId(req)]
    );
    return res.json({ meters });
  } catch (error) {
    console.error("Get user meters error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserBills = async (req: Request, res: Response) => {
  try {
    const [bills] = await pool.query(
      `SELECT id, meter_id, billing_month, previous_reading, current_reading,
              units_consumed, amount, due_date, status
       FROM bills WHERE user_id = ? ORDER BY id DESC`, [userId(req)]
    );
    return res.json({ bills });
  } catch (error) {
    console.error("Get user bills error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserBillById = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, meter_id, billing_month, previous_reading, current_reading,
              units_consumed, amount, due_date, status
       FROM bills WHERE id = ? AND user_id = ?`,
      [req.params.id, userId(req)]
    );
    const bills = rows as any[];
    if (!bills.length) return res.status(404).json({ message: "Bill not found" });
    return res.json({ bill: bills[0] });
  } catch (error) {
    console.error("Get user bill error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const [payments] = await pool.query(
      `SELECT id, bill_id, amount, payment_date, payment_method,
              transaction_id, status
       FROM payments WHERE user_id = ? ORDER BY id DESC`, [userId(req)]
    );
    return res.json({ payments });
  } catch (error) {
    console.error("Get user payments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserPaymentById = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, bill_id, amount, payment_date, payment_method,
              transaction_id, status
       FROM payments WHERE id = ? AND user_id = ?`,
      [req.params.id, userId(req)]
    );
    const payments = rows as any[];
    if (!payments.length) return res.status(404).json({ message: "Payment not found" });
    return res.json({ payment: payments[0] });
  } catch (error) {
    console.error("Get user payment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
