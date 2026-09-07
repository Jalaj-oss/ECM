import type { Request, Response } from "express";
import pool from "../config/Database.js";

const userId = (req: Request) => Number((req as any).user?.id);

export const createComplaint = async (req: Request, res: Response) => {
  try {
    const id = userId(req);
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    const { category, subject, description, meter_id } = req.body;

    if (!category?.trim() || !subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Category, subject, and description are required.",
      });
    }

    let validMeterId: number | null = null;
    if (meter_id) {
      const parsedMeterId = Number(meter_id);
      if (!isNaN(parsedMeterId) && parsedMeterId > 0) {
        // Verify meter belongs to user
        const [meterRows]: any = await pool.query(
          "SELECT id FROM meters WHERE id = ? AND user_id = ?",
          [parsedMeterId, id]
        );
        if (meterRows.length > 0) {
          validMeterId = parsedMeterId;
        }
      }
    }

    const [result]: any = await pool.query(
      `INSERT INTO complaints (user_id, meter_id, category, subject, description, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [id, validMeterId, category.trim(), subject.trim(), description.trim()]
    );

    return res.status(201).json({
      message: "Complaint submitted successfully.",
      complaint_id: result.insertId,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserComplaints = async (req: Request, res: Response) => {
  try {
    const id = userId(req);
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    const [rows]: any = await pool.query(
      `SELECT c.id, c.user_id, c.meter_id, c.category, c.subject, c.description,
              c.status, c.admin_remarks, c.created_at, c.updated_at,
              m.meter_number
       FROM complaints c
       LEFT JOIN meters m ON c.meter_id = m.id
       WHERE c.user_id = ?
       ORDER BY c.id DESC`,
      [id]
    );

    return res.json({ complaints: rows });
  } catch (error) {
    console.error("Get user complaints error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserComplaintById = async (req: Request, res: Response) => {
  try {
    const id = userId(req);
    if (!id) return res.status(401).json({ message: "Unauthorized" });

    const complaintId = Number(req.params.id);
    if (isNaN(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const [rows]: any = await pool.query(
      `SELECT c.id, c.user_id, c.meter_id, c.category, c.subject, c.description,
              c.status, c.admin_remarks, c.created_at, c.updated_at,
              m.meter_number
       FROM complaints c
       LEFT JOIN meters m ON c.meter_id = m.id
       WHERE c.id = ? AND c.user_id = ?`,
      [complaintId, id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.json({ complaint: rows[0] });
  } catch (error) {
    console.error("Get user complaint by id error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
