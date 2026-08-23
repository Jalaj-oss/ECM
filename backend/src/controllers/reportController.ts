import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import pool from "../config/Database.js";

interface CountRow extends RowDataPacket {
  count: number;
}

export const getReportSummary = async (
  _req: Request,
  res: Response
) => {
  try {
    const [users] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'user'"
    );

    const [meters] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM meters"
    );

    const [activeMeters] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM meters WHERE status = 'active'"
    );

    const [bills] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM bills"
    );

    const [pendingBills] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM bills WHERE status = 'pending'"
    );

    const [paidBills] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM bills WHERE status = 'paid'"
    );

    const [overdueBills] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM bills WHERE status = 'overdue'"
    );

    const [payments] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM payments"
    );

    const [completedPayments] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM payments WHERE status = 'completed'"
    );

    const [failedPayments] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS count FROM payments WHERE status = 'failed'"
    );

    return res.status(200).json({
      users: users[0]?.count || 0,
      meters: meters[0]?.count || 0,
      activeMeters: activeMeters[0]?.count || 0,
      bills: bills[0]?.count || 0,
      pendingBills: pendingBills[0]?.count || 0,
      paidBills: paidBills[0]?.count || 0,
      overdueBills: overdueBills[0]?.count || 0,
      payments: payments[0]?.count || 0,
      completedPayments: completedPayments[0]?.count || 0,
      failedPayments: failedPayments[0]?.count || 0,
    });
  } catch (error) {
    console.error("Get report summary error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};