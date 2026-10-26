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
  const matched = req.headers["x-matched-path"] || req.headers["x-now-route-matches"];
  if (matched && typeof matched === "string" && matched !== "/api" && matched !== "/api/") {
    req.url = matched;
  }
  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  await ensureDb();
  return app(req, res);
}
