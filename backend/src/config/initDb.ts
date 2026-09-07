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

    console.log("Database migrations/checks completed successfully.");
  } catch (error) {
    console.error("Database migration error:", error);
  }
};
