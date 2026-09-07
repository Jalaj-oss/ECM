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

// ==========================================
// ADMIN COMPLAINT CONTROLLERS
// ==========================================

export const getAllComplaintsAdmin = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT c.id, c.user_id, c.meter_id, c.category, c.subject, c.description,
             c.status, c.admin_remarks, c.created_at, c.updated_at,
             u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
             m.meter_number
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN meters m ON c.meter_id = m.id
    `;
    const params: any[] = [];

    if (status && typeof status === "string" && status !== "all") {
      query += " WHERE c.status = ?";
      params.push(status);
    }

    query += " ORDER BY c.id DESC";

    const [rows]: any = await pool.query(query, params);

    return res.json({ complaints: rows });
  } catch (error) {
    console.error("Get all complaints admin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getComplaintByIdAdmin = async (req: Request, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    if (isNaN(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const [rows]: any = await pool.query(
      `SELECT c.id, c.user_id, c.meter_id, c.category, c.subject, c.description,
              c.status, c.admin_remarks, c.created_at, c.updated_at,
              u.name AS user_name, u.email AS user_email, u.phone AS user_phone, u.address AS user_address,
              m.meter_number, m.meter_type
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN meters m ON c.meter_id = m.id
       WHERE c.id = ?`,
      [complaintId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.json({ complaint: rows[0] });
  } catch (error) {
    console.error("Get complaint by id admin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateComplaintStatusAdmin = async (req: Request, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    if (isNaN(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const { status, admin_remarks } = req.body;

    const validStatuses = ["pending", "in_progress", "resolved", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Verify complaint exists
    const [existing]: any = await pool.query(
      "SELECT id FROM complaints WHERE id = ?",
      [complaintId]
    );
    if (!existing.length) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    await pool.query(
      "UPDATE complaints SET status = ?, admin_remarks = ? WHERE id = ?",
      [status, admin_remarks !== undefined ? admin_remarks : null, complaintId]
    );

    const [updated]: any = await pool.query(
      `SELECT c.id, c.user_id, c.meter_id, c.category, c.subject, c.description,
              c.status, c.admin_remarks, c.created_at, c.updated_at,
              u.name AS user_name, u.email AS user_email,
              m.meter_number
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN meters m ON c.meter_id = m.id
       WHERE c.id = ?`,
      [complaintId]
    );

    return res.json({
      message: "Complaint updated successfully",
      complaint: updated[0],
    });
  } catch (error) {
    console.error("Update complaint status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteComplaintAdmin = async (req: Request, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    if (isNaN(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const [existing]: any = await pool.query(
      "SELECT id FROM complaints WHERE id = ?",
      [complaintId]
    );
    if (!existing.length) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    await pool.query("DELETE FROM complaints WHERE id = ?", [complaintId]);

    return res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Delete complaint error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

