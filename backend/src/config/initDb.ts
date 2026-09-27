import pool from "./Database.js";
import bcrypt from "bcrypt";

export const initDb = async () => {
  try {
    console.log("Running database migrations/checks...");

    // 1. Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        phone VARCHAR(20) NULL,
        address TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure phone & address columns exist if table was already created
    const [phoneCol]: any = await pool.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns 
       WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'phone'`
    );
    if (phoneCol[0]?.cnt === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL");
    }

    const [addrCol]: any = await pool.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns 
       WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'address'`
    );
    if (addrCol[0]?.cnt === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN address TEXT NULL");
    }

    // Seed default admin and user if users table is empty
    const [userRows]: any = await pool.query("SELECT COUNT(*) AS cnt FROM users");
    if (userRows[0]?.cnt === 0) {
      const adminPass = await bcrypt.hash("admin123", 10);
      const userPass = await bcrypt.hash("user123", 10);

      await pool.query(
        `INSERT INTO users (name, email, password, role, phone, address) VALUES
         ('Administrator', 'admin@test.com', ?, 'admin', '9876543210', 'Admin Office, Central Grid'),
         ('Test User', 'user@test.com', ?, 'user', '9876543211', '123 Power Grid Lane, Sector 4')`,
        [adminPass, userPass]
      );
      console.log("Database: Seeded default admin and user accounts.");
    }

    // 2. Create meters table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        meter_number VARCHAR(100) NOT NULL UNIQUE,
        meter_type VARCHAR(100) DEFAULT 'electricity',
        installation_date DATE NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_meter_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Create bills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        meter_id INT NOT NULL,
        billing_month DATE NOT NULL,
        previous_reading DECIMAL(10, 2) NOT NULL,
        current_reading DECIMAL(10, 2) NOT NULL,
        units_consumed DECIMAL(10, 2) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_bill_user (user_id),
        INDEX idx_bill_meter (meter_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE
      )
    `);

    // 4. Create payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        bill_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_method ENUM('cash', 'card', 'upi', 'bank_transfer') DEFAULT 'card',
        transaction_id VARCHAR(255) NULL,
        status ENUM('completed', 'failed', 'pending') DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payment_user (user_id),
        INDEX idx_payment_bill (bill_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
      )
    `);

    // 5. Create complaints table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        meter_id INT NULL,
        category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
        admin_remarks TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_comp_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Database migrations/checks completed successfully.");
  } catch (error) {
    console.error("Database migration error:", error);
  }
};
