import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import pool from "../config/Database.js";

interface CountRow extends RowDataPacket {
  count: number;
}

interface TotalRow extends RowDataPacket {
  total: number;
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

    const [sumBilled] = await pool.query<TotalRow[]>(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM bills"
    );

    const [sumPaid] = await pool.query<TotalRow[]>(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM bills WHERE status = 'paid'"
    );

    const [sumOutstanding] = await pool.query<TotalRow[]>(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM bills WHERE status IN ('pending', 'overdue')"
    );

    const [recentBills] = await pool.query<RowDataPacket[]>(
      `SELECT b.id, b.billing_month, b.amount, b.status, u.name AS user_name, m.meter_number 
       FROM bills b 
       LEFT JOIN users u ON b.user_id = u.id 
       LEFT JOIN meters m ON b.meter_id = m.id 
       ORDER BY b.id DESC LIMIT 5`
    );

    const [recentPayments] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.amount, p.payment_date, p.payment_method, p.status, u.name AS user_name 
       FROM payments p 
       LEFT JOIN users u ON p.user_id = u.id 
       ORDER BY p.id DESC LIMIT 5`
    );

    const userCount = Number(users[0]?.count || 0);
    const meterCount = Number(meters[0]?.count || 0);
    const activeMeterCount = Number(activeMeters[0]?.count || 0);
    const billCount = Number(bills[0]?.count || 0);
    const pendingBillCount = Number(pendingBills[0]?.count || 0);
    const paidBillCount = Number(paidBills[0]?.count || 0);
    const overdueBillCount = Number(overdueBills[0]?.count || 0);
    const paymentCount = Number(payments[0]?.count || 0);
    const completedPaymentCount = Number(completedPayments[0]?.count || 0);
    const failedPaymentCount = Number(failedPayments[0]?.count || 0);
    const totalBilled = Number(sumBilled[0]?.total || 0);
    const totalPaidBills = Number(sumPaid[0]?.total || 0);
    const outstandingAmount = Number(sumOutstanding[0]?.total || 0);

    const summaryData = {
      users: userCount,
      meters: meterCount,
      activeMeters: activeMeterCount,
      bills: billCount,
      pendingBills: pendingBillCount,
      paidBills: paidBillCount,
      overdueBills: overdueBillCount,
      payments: paymentCount,
      paymentCount: paymentCount,
      completedPayments: completedPaymentCount,
      failedPayments: failedPaymentCount,
      totalBilled,
      totalPaidBills,
      outstandingAmount,
      totalPayments: totalPaidBills,
    };

    return res.status(200).json({
      ...summaryData,
      summary: summaryData,
      recentBills,
      recentPayments,
    });
  } catch (error) {
    console.error("Get report summary error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};