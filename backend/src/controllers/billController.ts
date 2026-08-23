import type { Request, Response } from "express";
import pool from "../config/Database.js";

const formatDate = (value: unknown) =>
  value ? String(value).split("T")[0] : null;

export const getBills = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        b.id,
        b.user_id,
        b.meter_id,
        b.billing_month,
        b.previous_reading,
        b.current_reading,
        b.units_consumed,
        b.amount,
        b.due_date,
        b.status,
        u.name AS user_name,
        u.email AS user_email,
        m.meter_number
      FROM bills b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN meters m ON b.meter_id = m.id
      ORDER BY b.id DESC
    `);

    return res.status(200).json({ bills: rows });
  } catch (error) {
    console.error("Get bills error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBillById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        b.id,
        b.user_id,
        b.meter_id,
        b.billing_month,
        b.previous_reading,
        b.current_reading,
        b.units_consumed,
        b.amount,
        b.due_date,
        b.status,
        u.name AS user_name,
        u.email AS user_email,
        m.meter_number,
        m.meter_type
      FROM bills b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN meters m ON b.meter_id = m.id
      WHERE b.id = ?
      `,
      [id]
    );

    const bills = rows as any[];

    if (bills.length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    return res.status(200).json({ bill: bills[0] });
  } catch (error) {
    console.error("Get bill error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createBill = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      meter_id,
      billing_month,
      previous_reading,
      current_reading,
      units_consumed,
      amount,
      due_date,
      status,
    } = req.body;

    if (
      !user_id ||
      !meter_id ||
      !billing_month ||
      previous_reading === undefined ||
      current_reading === undefined ||
      units_consumed === undefined ||
      amount === undefined ||
      !due_date
    ) {
      return res.status(400).json({
        message: "All bill fields are required",
      });
    }

    const billStatus = status || "pending";

    if (!["pending", "paid", "overdue"].includes(billStatus)) {
      return res.status(400).json({ message: "Invalid bill status" });
    }

    if (
      Number(previous_reading) < 0 ||
      Number(current_reading) < 0 ||
      Number(units_consumed) < 0 ||
      Number(amount) < 0
    ) {
      return res.status(400).json({
        message: "Reading, units and amount cannot be negative",
      });
    }

    if (Number(current_reading) < Number(previous_reading)) {
      return res.status(400).json({
        message: "Current reading cannot be less than previous reading",
      });
    }

    const [users] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [meters] = await pool.query(
      "SELECT id, user_id FROM meters WHERE id = ?",
      [meter_id]
    );

    const meterRows = meters as any[];

    if (meterRows.length === 0) {
      return res.status(404).json({ message: "Meter not found" });
    }

    if (Number(meterRows[0].user_id) !== Number(user_id)) {
      return res.status(400).json({
        message: "Selected meter does not belong to selected user",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM bills WHERE meter_id = ? AND billing_month = ?",
      [meter_id, formatDate(billing_month)]
    );

    if ((existing as any[]).length > 0) {
      return res.status(409).json({
        message: "A bill already exists for this meter and billing month",
      });
    }

    await pool.query(
      `
      INSERT INTO bills
      (user_id, meter_id, billing_month, previous_reading, current_reading,
       units_consumed, amount, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        meter_id,
        formatDate(billing_month),
        previous_reading,
        current_reading,
        units_consumed,
        amount,
        formatDate(due_date),
        billStatus,
      ]
    );

    return res.status(201).json({
      message: "Bill created successfully",
    });
  } catch (error) {
    console.error("Create bill error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateBill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      user_id,
      meter_id,
      billing_month,
      previous_reading,
      current_reading,
      units_consumed,
      amount,
      due_date,
      status,
    } = req.body;

    if (
      !user_id ||
      !meter_id ||
      !billing_month ||
      previous_reading === undefined ||
      current_reading === undefined ||
      units_consumed === undefined ||
      amount === undefined ||
      !due_date ||
      !status
    ) {
      return res.status(400).json({
        message: "All bill fields are required",
      });
    }

    if (!["pending", "paid", "overdue"].includes(status)) {
      return res.status(400).json({ message: "Invalid bill status" });
    }

    if (Number(current_reading) < Number(previous_reading)) {
      return res.status(400).json({
        message: "Current reading cannot be less than previous reading",
      });
    }

    const [billRows] = await pool.query(
      "SELECT id FROM bills WHERE id = ?",
      [id]
    );

    if ((billRows as any[]).length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const [users] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [meters] = await pool.query(
      "SELECT id, user_id FROM meters WHERE id = ?",
      [meter_id]
    );

    const meterRows = meters as any[];

    if (meterRows.length === 0) {
      return res.status(404).json({ message: "Meter not found" });
    }

    if (Number(meterRows[0].user_id) !== Number(user_id)) {
      return res.status(400).json({
        message: "Selected meter does not belong to selected user",
      });
    }

    const [duplicate] = await pool.query(
      `
      SELECT id FROM bills
      WHERE meter_id = ? AND billing_month = ? AND id != ?
      `,
      [meter_id, formatDate(billing_month), id]
    );

    if ((duplicate as any[]).length > 0) {
      return res.status(409).json({
        message: "A bill already exists for this meter and billing month",
      });
    }

    await pool.query(
      `
      UPDATE bills
      SET
        user_id = ?,
        meter_id = ?,
        billing_month = ?,
        previous_reading = ?,
        current_reading = ?,
        units_consumed = ?,
        amount = ?,
        due_date = ?,
        status = ?
      WHERE id = ?
      `,
      [
        user_id,
        meter_id,
        formatDate(billing_month),
        previous_reading,
        current_reading,
        units_consumed,
        amount,
        formatDate(due_date),
        status,
        id,
      ]
    );

    return res.status(200).json({
      message: "Bill updated successfully",
    });
  } catch (error) {
    console.error("Update bill error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteBill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM bills WHERE id = ?",
      [id]
    );

    const deleteResult = result as any;

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    return res.status(200).json({
      message: "Bill deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete bill error:", error);

    if (error?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "Cannot delete a bill that has payments",
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
};
