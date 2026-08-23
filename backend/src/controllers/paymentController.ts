import type { Request, Response } from "express";
import pool from "../config/Database.js";

const formatDateTimeForMySQL = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
};

export const getPayments = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.bill_id,
        p.user_id,
        p.amount,
        p.payment_date,
        p.payment_method,
        p.transaction_id,
        p.status,
        u.name AS user_name,
        u.email AS user_email,
        b.billing_month,
        b.due_date,
        b.amount AS bill_amount,
        m.meter_number
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN bills b ON p.bill_id = b.id
      LEFT JOIN meters m ON b.meter_id = m.id
      ORDER BY p.id DESC
    `);

    return res.status(200).json({ payments: rows });
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.bill_id,
        p.user_id,
        p.amount,
        p.payment_date,
        p.payment_method,
        p.transaction_id,
        p.status,
        u.name AS user_name,
        u.email AS user_email,
        b.billing_month,
        b.due_date,
        b.amount AS bill_amount,
        m.meter_number
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN bills b ON p.bill_id = b.id
      LEFT JOIN meters m ON b.meter_id = m.id
      WHERE p.id = ?
      `,
      [id]
    );

    const payments = rows as any[];

    if (payments.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({ payment: payments[0] });
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const syncBillStatus = async (billId: number) => {
  const [billRows] = await pool.query(
    "SELECT amount, due_date, status FROM bills WHERE id = ?",
    [billId]
  );

  const bills = billRows as any[];
  if (bills.length === 0) return;

  const [paymentRows] = await pool.query(
    `
    SELECT COALESCE(SUM(amount), 0) AS total_paid
    FROM payments
    WHERE bill_id = ? AND status = 'completed'
    `,
    [billId]
  );

  const totalPaid = Number((paymentRows as any[])[0]?.total_paid || 0);
  const billAmount = Number(bills[0].amount || 0);

  let nextStatus: "pending" | "paid" | "overdue";

  if (totalPaid >= billAmount && billAmount > 0) {
    nextStatus = "paid";
  } else if (
    bills[0].due_date &&
    new Date(`${String(bills[0].due_date).split("T")[0]}T23:59:59`) <
      new Date()
  ) {
    nextStatus = "overdue";
  } else {
    nextStatus = "pending";
  }

  await pool.query(
    "UPDATE bills SET status = ? WHERE id = ?",
    [nextStatus, billId]
  );
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const {
      bill_id,
      user_id,
      amount,
      payment_date,
      payment_method,
      transaction_id,
      status,
    } = req.body;

    if (
      !bill_id ||
      !user_id ||
      amount === undefined ||
      !payment_method
    ) {
      return res.status(400).json({
        message: "Bill, user, amount and payment method are required",
      });
    }

    if (!["cash", "card", "upi", "bank_transfer"].includes(payment_method)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const paymentStatus = status || "completed";

    if (!["pending", "completed", "failed"].includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero",
      });
    }

    const [bills] = await pool.query(
      `
      SELECT id, user_id, amount
      FROM bills
      WHERE id = ?
      `,
      [bill_id]
    );

    const billRows = bills as any[];

    if (billRows.length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (Number(billRows[0].user_id) !== Number(user_id)) {
      return res.status(400).json({
        message: "Selected bill does not belong to selected user",
      });
    }

    if (transaction_id) {
      const [existingTransaction] = await pool.query(
        "SELECT id FROM payments WHERE transaction_id = ?",
        [transaction_id]
      );

      if ((existingTransaction as any[]).length > 0) {
        return res.status(409).json({
          message: "Transaction ID already exists",
        });
      }
    }

    const formattedPaymentDate = payment_date
      ? formatDateTimeForMySQL(payment_date)
      : null;

    await pool.query(
      `
      INSERT INTO payments
      (bill_id, user_id, amount, payment_date, payment_method, transaction_id, status)
      VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, ?)
      `,
      [
        bill_id,
        user_id,
        amount,
        formattedPaymentDate,
        payment_method,
        transaction_id || null,
        paymentStatus,
      ]
    );

    if (paymentStatus === "completed") {
      await syncBillStatus(Number(bill_id));
    }

    return res.status(201).json({
      message: "Payment created successfully",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      bill_id,
      user_id,
      amount,
      payment_date,
      payment_method,
      transaction_id,
      status,
    } = req.body;

    if (
      !bill_id ||
      !user_id ||
      amount === undefined ||
      !payment_method ||
      !status
    ) {
      return res.status(400).json({
        message: "Bill, user, amount, method and status are required",
      });
    }

    if (!["cash", "card", "upi", "bank_transfer"].includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const [paymentRows] = await pool.query(
      "SELECT id, bill_id AS old_bill_id FROM payments WHERE id = ?",
      [id]
    );

    const payments = paymentRows as any[];

    if (payments.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const [bills] = await pool.query(
      "SELECT id, user_id FROM bills WHERE id = ?",
      [bill_id]
    );

    const billRows = bills as any[];

    if (billRows.length === 0) {
      return res.status(404).json({ message: "Bill not found" });
    }

    if (Number(billRows[0].user_id) !== Number(user_id)) {
      return res.status(400).json({
        message: "Selected bill does not belong to selected user",
      });
    }

    if (transaction_id) {
      const [existingTransaction] = await pool.query(
        "SELECT id FROM payments WHERE transaction_id = ? AND id != ?",
        [transaction_id, id]
      );

      if ((existingTransaction as any[]).length > 0) {
        return res.status(409).json({
          message: "Transaction ID already exists",
        });
      }
    }

    const formattedPaymentDate = payment_date
      ? formatDateTimeForMySQL(payment_date)
      : null;

    await pool.query(
      `
      UPDATE payments
      SET
        bill_id = ?,
        user_id = ?,
        amount = ?,
        payment_date = COALESCE(?, payment_date),
        payment_method = ?,
        transaction_id = ?,
        status = ?
      WHERE id = ?
      `,
      [
        bill_id,
        user_id,
        amount,
        formattedPaymentDate,
        payment_method,
        transaction_id || null,
        status,
        id,
      ]
    );

    await syncBillStatus(Number(payments[0].old_bill_id));

    if (Number(payments[0].old_bill_id) !== Number(bill_id)) {
      await syncBillStatus(Number(bill_id));
    }

    return res.status(200).json({
      message: "Payment updated successfully",
    });
  } catch (error) {
    console.error("Update payment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT bill_id FROM payments WHERE id = ?",
      [id]
    );

    const payments = rows as any[];

    if (payments.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    await pool.query(
      "DELETE FROM payments WHERE id = ?",
      [id]
    );

    await syncBillStatus(Number(payments[0].bill_id));

    return res.status(200).json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
