import type { Request, Response } from "express";
import pool from "../config/Database.js";
import bcrypt from "bcrypt";

export const getUsers = async (req: Request, res: Response) => {
  try {
    let rows: any[];
    try {
      const [data] = await pool.query(
        "SELECT id, name, email, role, phone, address FROM users ORDER BY id DESC"
      );
      rows = data as any[];
    } catch {
      const [data] = await pool.query(
        "SELECT id, name, email, role FROM users ORDER BY id DESC"
      );
      rows = (data as any[]).map(u => ({ ...u, phone: null, address: null }));
    }

    return res.status(200).json({
      users: rows,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let users: any[];
    try {
      const [rows] = await pool.query(
        "SELECT id, name, email, role, phone, address FROM users WHERE id = ?",
        [id]
      );
      users = rows as any[];
    } catch {
      const [rows] = await pool.query(
        "SELECT id, name, email, role FROM users WHERE id = ?",
        [id]
      );
      users = (rows as any[]).map(u => ({ ...u, phone: null, address: null }));
    }

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user: users[0],
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (role !== "admin" && role !== "user") {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await pool.query(
        "INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, role, phone || null, address || null]
      );
    } catch {
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );
    }

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, address } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        message: "Name, email and role are required",
      });
    }

    if (role !== "admin" && role !== "user") {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Check whether the user exists
    const [existingUser] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if ((existingUser as any[]).length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check whether another user already uses this email
    const [existingEmail] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id]
    );

    if ((existingEmail as any[]).length > 0) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Update user
    try {
      await pool.query(
        "UPDATE users SET name = ?, email = ?, role = ?, phone = ?, address = ? WHERE id = ?",
        [name, email, role, phone !== undefined ? phone : null, address !== undefined ? address : null, id]
      );
    } catch {
      await pool.query(
        "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
        [name, email, role, id]
      );
    }

    return res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check that the user exists
    const [users] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if ((users as any[]).length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent deleting the currently logged-in admin
    const currentUserId = (req as any).user?.id;

    if (currentUserId && Number(currentUserId) === Number(id)) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    await pool.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
