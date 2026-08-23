import type { Request, Response } from "express";
import pool from "../config/Database.js";
import bcrypt from "bcrypt";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if ((existing as any[]).length > 0) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'user')`,
      [name.trim(), normalizedEmail, hashedPassword]
    );

    return res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Register user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
