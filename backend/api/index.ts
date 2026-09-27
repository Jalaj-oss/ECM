import app from "../src/server.js";
import { initDb } from "../src/config/initDb.js";

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
        dbReadyPromise = null;
      });
  }
  return dbReadyPromise!;
};

export default async function handler(req: any, res: any) {
  await ensureDb();
  return app(req, res);
}
