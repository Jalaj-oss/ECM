import pool from "./Database.js";

export const initDb = async () => {
  try {
    console.log("Running database migrations/checks...");
    
    // Check and add phone column
    const [phoneCol]: any = await pool.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns 
       WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'phone'`
    );
    if (phoneCol[0]?.cnt === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL");
      console.log("Migration: Added 'phone' column to users table");
    }

    // Check and add address column
    const [addrCol]: any = await pool.query(
      `SELECT COUNT(*) AS cnt FROM information_schema.columns 
       WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'address'`
    );
    if (addrCol[0]?.cnt === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN address TEXT NULL");
      console.log("Migration: Added 'address' column to users table");
    }

    // Check and create complaints table
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
        INDEX idx_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Database: Verified complaints table exists.");

    console.log("Database migrations/checks completed successfully.");
  } catch (error) {
    console.error("Database migration error:", error);
  }
};
