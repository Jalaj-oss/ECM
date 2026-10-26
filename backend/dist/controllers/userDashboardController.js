import pool from "../config/Database.js";
const userId = (req) => Number(req.user?.id);
export const getUserDashboard = async (req, res) => {
    try {
        const id = userId(req);
        if (!id)
            return res.status(401).json({ message: "Unauthorized" });
        let userRows = [];
        try {
            const [users] = await pool.query("SELECT id, name, email, role, phone, address FROM users WHERE id = ?", [id]);
            userRows = users;
        }
        catch {
            const [users] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
            userRows = users.map(u => ({ ...u, phone: null, address: null }));
        }
        if (!userRows.length)
            return res.status(404).json({ message: "User not found" });
        const [meters] = await pool.query(`SELECT id, meter_number, meter_type, installation_date, status
       FROM meters WHERE user_id = ? ORDER BY id DESC`, [id]);
        const [bills] = await pool.query(`SELECT id, meter_id, billing_month, previous_reading, current_reading,
              units_consumed, amount, due_date, status
       FROM bills WHERE user_id = ? ORDER BY id DESC`, [id]);
        const [payments] = await pool.query(`SELECT id, bill_id, amount, payment_date, payment_method,
              transaction_id, status
       FROM payments WHERE user_id = ? ORDER BY id DESC`, [id]);
        let complaints = [];
        try {
            const [complaintRows] = await pool.query(`SELECT id, category, subject, status, created_at
         FROM complaints WHERE user_id = ? ORDER BY id DESC`, [id]);
            complaints = complaintRows;
        }
        catch {
            complaints = [];
        }
        return res.json({ user: userRows[0], meters, bills, payments, complaints });
    }
    catch (error) {
        console.error("Get user dashboard error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const getUserProfile = async (req, res) => {
    try {
        const id = userId(req);
        let users = [];
        try {
            const [rows] = await pool.query("SELECT id, name, email, role, phone, address FROM users WHERE id = ?", [id]);
            users = rows;
        }
        catch {
            const [rows] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
            users = rows.map(u => ({ ...u, phone: null, address: null }));
        }
        if (!users.length)
            return res.status(404).json({ message: "User not found" });
        return res.json({ user: users[0] });
    }
    catch (error) {
        console.error("Get user profile error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const getUserMeters = async (req, res) => {
    try {
        const [meters] = await pool.query(`SELECT id, meter_number, meter_type, installation_date, status
       FROM meters WHERE user_id = ? ORDER BY id DESC`, [userId(req)]);
        return res.json({ meters });
    }
    catch (error) {
        console.error("Get user meters error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const getUserBills = async (req, res) => {
    try {
        const [bills] = await pool.query(`SELECT id, meter_id, billing_month, previous_reading, current_reading,
              units_consumed, amount, due_date, status
       FROM bills WHERE user_id = ? ORDER BY id DESC`, [userId(req)]);
        return res.json({ bills });
    }
    catch (error) {
        console.error("Get user bills error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const getUserBillById = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT id, meter_id, billing_month, previous_reading, current_reading,
              units_consumed, amount, due_date, status
       FROM bills WHERE id = ? AND user_id = ?`, [req.params.id, userId(req)]);
        const bills = rows;
        if (!bills.length)
            return res.status(404).json({ message: "Bill not found" });
        return res.json({ bill: bills[0] });
    }
    catch (error) {
        console.error("Get user bill error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const getUserPayments = async (req, res) => {
    try {
        const [payments] = await pool.query(`SELECT id, bill_id, amount, payment_date, payment_method,
              transaction_id, status
       FROM payments WHERE user_id = ? ORDER BY id DESC`, [userId(req)]);
        return res.json({ payments });
    }
    catch (error) {
        console.error("Get user payments error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const getUserPaymentById = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT id, bill_id, amount, payment_date, payment_method,
              transaction_id, status
       FROM payments WHERE id = ? AND user_id = ?`, [req.params.id, userId(req)]);
        const payments = rows;
        if (!payments.length)
            return res.status(404).json({ message: "Payment not found" });
        return res.json({ payment: payments[0] });
    }
    catch (error) {
        console.error("Get user payment error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
