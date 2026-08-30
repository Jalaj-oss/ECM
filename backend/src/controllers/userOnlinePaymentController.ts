import type { Request, Response } from "express";
import pool from "../config/Database.js";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  console.warn("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(stripeSecret || "sk_test_placeholder");

const getUserId = (req: Request) => Number((req as any).user?.id);

export const createBillCheckoutSession = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const billId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!billId) {
      return res.status(400).json({ message: "Invalid bill ID" });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, amount, status
       FROM bills
       WHERE id = ? AND user_id = ?`,
      [billId, userId]
    );

    const bills = rows as any[];

    if (!bills.length) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const bill = bills[0];

    if (String(bill.status).toLowerCase() === "paid") {
      return res.status(400).json({ message: "Bill is already paid" });
    }

    if (Number(bill.amount) <= 0) {
      return res.status(400).json({ message: "Invalid bill amount" });
    }

    if (!stripeSecret) {
      return res.status(500).json({
        message: "Online payment is not configured on the server",
      });
    }

    const frontendUrl =
      process.env.FRONTEND_URL || "https://frontend-production-d4e7.up.railway.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: process.env.PAYMENT_CURRENCY || "inr",
            product_data: {
              name: `EHMS Electricity Bill #${bill.id}`,
            },
            unit_amount: Math.round(Number(bill.amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bill_id: String(bill.id),
        user_id: String(userId),
      },
      success_url:
        `${frontendUrl}/user/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        `${frontendUrl}/user/bills/${bill.id}`,
    });

    return res.status(200).json({
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Create bill checkout session error:", error);
    return res.status(500).json({
      message: "Unable to start online payment",
    });
  }
};

export const verifyCheckoutSession = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const sessionId = String(req.query.session_id || "");

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    if (!stripeSecret) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeErr: any) {
      return res.status(404).json({
        message: "Invalid or expired payment session. Please try paying your bill again from My Bills.",
      });
    }

    const billId = Number(session.metadata?.bill_id);

    if (!billId) {
      return res.status(400).json({ message: "Bill ID missing from payment metadata" });
    }

    const [billRows] = await pool.query(
      `SELECT id, user_id, amount, status
       FROM bills
       WHERE id = ?`,
      [billId]
    );

    const bills = billRows as any[];

    if (!bills.length) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const bill = bills[0];

    // If bill is already marked paid, return success directly
    if (String(bill.status).toLowerCase() === "paid") {
      const [payRows] = await pool.query(
        "SELECT transaction_id FROM payments WHERE bill_id = ? ORDER BY id DESC LIMIT 1",
        [billId]
      );
      const paymentRecord = (payRows as any[])[0];

      return res.status(200).json({
        success: true,
        message: "Payment confirmed",
        billId,
        amount: bill.amount,
        transactionId: paymentRecord?.transaction_id || session.payment_intent || session.id,
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment was not completed. Please return to My Bills and complete payment.",
      });
    }

    const transactionId = session.payment_intent
      ? String(session.payment_intent)
      : session.id;

    await pool.query(
      `INSERT INTO payments
       (bill_id, user_id, amount, payment_date,
        payment_method, transaction_id, status)
       VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
      [
        billId,
        userId,
        bill.amount,
        "card",
        transactionId,
        "completed",
      ]
    );

    await pool.query(
      "UPDATE bills SET status = 'paid' WHERE id = ?",
      [billId]
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and recorded successfully",
      billId,
      amount: bill.amount,
      transactionId,
    });
  } catch (error) {
    console.error("Verify checkout session error:", error);
    return res.status(500).json({
      message: "Unable to verify payment session",
    });
  }
};

export const handleStripeWebhook = async (
  req: Request,
  res: Response
) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({
        message: "Stripe webhook is not configured",
      });
    }

    const signature = req.headers["stripe-signature"];

    if (!signature || Array.isArray(signature)) {
      return res.status(400).json({
        message: "Missing Stripe signature",
      });
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const billId = Number(session.metadata?.bill_id);
      const userId = Number(session.metadata?.user_id);

      if (billId && userId && session.payment_status === "paid") {
        const transactionId =
          session.payment_intent
            ? String(session.payment_intent)
            : session.id;

        const [billRows] = await pool.query(
          `SELECT id, user_id, amount, status
           FROM bills
           WHERE id = ? AND user_id = ?`,
          [billId, userId]
        );

        const bills = billRows as any[];

        if (bills.length && String(bills[0].status).toLowerCase() !== "paid") {
          await pool.query(
            `INSERT INTO payments
             (bill_id, user_id, amount, payment_date,
              payment_method, transaction_id, status)
             VALUES (?, ?, ?, NOW(), ?, ?, ?)`,
            [
              billId,
              userId,
              bills[0].amount,
              "card",
              transactionId,
              "completed",
            ]
          );

          await pool.query(
            "UPDATE bills SET status = 'paid' WHERE id = ? AND user_id = ?",
            [billId, userId]
          );
        }
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return res.status(400).json({
      message: "Webhook verification failed",
    });
  }
};
