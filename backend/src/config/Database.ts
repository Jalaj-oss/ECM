import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;

const pool = connectionUri
  ? mysql.createPool({
      uri: connectionUri,
      ssl: connectionUri.includes("ssl") || connectionUri.includes("tidb") || connectionUri.includes("aiven")
        ? { rejectUnauthorized: false }
        : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  : mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "railway",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

export default pool;