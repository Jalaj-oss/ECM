import type { Request, Response } from "express";
import pool from "../config/Database.js";

export const getMeters = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.id,
        m.meter_number,
        m.user_id,
        m.meter_type,
        m.installation_date,
        m.status,
        u.name AS user_name,
        u.email AS user_email
      FROM meters m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.id DESC
    `);

    return res.status(200).json({
      meters: rows,
    });
  } catch (error) {
    console.error("Get meters error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMeterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        m.id,
        m.meter_number,
        m.user_id,
        m.meter_type,
        m.installation_date,
        m.status,
        u.name AS user_name,
        u.email AS user_email
      FROM meters m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
      `,
      [id]
    );

    const meters = rows as any[];

    if (meters.length === 0) {
      return res.status(404).json({
        message: "Meter not found",
      });
    }

    return res.status(200).json({
      meter: meters[0],
    });
  } catch (error) {
    console.error("Get meter error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const createMeter = async (req: Request, res: Response) => {
  try {
    const {
      meter_number,
      user_id,
      meter_type,
      installation_date,
      status,
    } = req.body;

    if (!meter_number || !user_id || !meter_type) {
      return res.status(400).json({
        message: "Meter number, user and meter type are required",
      });
    }

    if (status && status !== "active" && status !== "inactive") {
      return res.status(400).json({
        message: "Invalid meter status",
      });
    }

    const [existingMeters] = await pool.query(
      "SELECT id FROM meters WHERE meter_number = ?",
      [meter_number]
    );

    if ((existingMeters as any[]).length > 0) {
      return res.status(409).json({
        message: "Meter number already exists",
      });
    }

    const [users] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await pool.query(
      `
      INSERT INTO meters
      (meter_number, user_id, meter_type, installation_date, status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        meter_number,
        user_id,
        meter_type,
        installation_date || null,
        status || "active",
      ]
    );

    return res.status(201).json({
      message: "Meter created successfully",
    });
  } catch (error) {
    console.error("Create meter error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateMeter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      meter_number,
      user_id,
      meter_type,
      installation_date,
      status,
    } = req.body;

    if (!meter_number || !user_id || !meter_type) {
      return res.status(400).json({
        message: "Meter number, user and meter type are required",
      });
    }

    if (status !== "active" && status !== "inactive") {
      return res.status(400).json({
        message: "Invalid meter status",
      });
    }

    const [meterRows] = await pool.query(
      "SELECT id FROM meters WHERE id = ?",
      [id]
    );

    if ((meterRows as any[]).length === 0) {
      return res.status(404).json({
        message: "Meter not found",
      });
    }

    const [duplicateRows] = await pool.query(
      "SELECT id FROM meters WHERE meter_number = ? AND id != ?",
      [meter_number, id]
    );

    if ((duplicateRows as any[]).length > 0) {
      return res.status(409).json({
        message: "Meter number already exists",
      });
    }

    const [users] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await pool.query(
      `
      UPDATE meters
      SET
        meter_number = ?,
        user_id = ?,
        meter_type = ?,
        installation_date = ?,
        status = ?
      WHERE id = ?
      `,
      [
        meter_number,
        user_id,
        meter_type,
        installation_date || null,
        status,
        id,
      ]
    );

    return res.status(200).json({
      message: "Meter updated successfully",
    });
  } catch (error) {
    console.error("Update meter error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteMeter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM meters WHERE id = ?",
      [id]
    );

    const deleteResult = result as any;

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        message: "Meter not found",
      });
    }

    return res.status(200).json({
      message: "Meter deleted successfully",
    });
  } catch (error) {
    console.error("Delete meter error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};