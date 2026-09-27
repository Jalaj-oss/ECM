import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../backend/src/server.js";
import { initDb } from "../backend/src/config/initDb.js";

let dbReady = false;
let dbReadyPromise: Promise<void> | null = null;

const ensureDb = (): Promise<void> => {
  if (dbReady) return Promise.resolve();
  if (!dbReadyPromise) {
    dbReadyPromise = initDb()
      .then(() => {
        dbReady = true;
      })
      .catch((err) => {
        console.error("DB init error:", err);
        dbReadyPromise = null; // allow retry
      });
  }
  return dbReadyPromise!;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureDb();
  return new Promise<void>((resolve) => {
    (app as any)(req, res as any, () => resolve());
    res.on("finish", resolve);
  });
}
