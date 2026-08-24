import https from "https";
import app from "./server.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);

  // Keep Railway server awake by pinging health endpoint every 5 minutes
  const SERVER_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/health`
    : process.env.SERVER_URL || "https://ecm-production-8450.up.railway.app/api/health";

  setInterval(() => {
    https.get(SERVER_URL, (res) => {
      console.log(`[Keep-Alive Ping] ${SERVER_URL} - Status: ${res.statusCode}`);
    }).on("error", (err) => {
      console.error(`[Keep-Alive Ping Error]: ${err.message}`);
    });
  }, 5 * 60 * 1000); // 5 minutes
});