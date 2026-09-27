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
        dbReadyPromise = null;
      });
  }
  return dbReadyPromise!;
};

export default async function handler(req: any, res: any) {
  // Preserve original URL so Express can route correctly
  if (!req.url) {
    const pathParts = (req.query?.path as string[]) ?? [];
    req.url = "/api/" + pathParts.join("/");
  }
  await ensureDb();
  return app(req, res);
}
