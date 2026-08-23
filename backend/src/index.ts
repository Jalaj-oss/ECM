import app from "./server.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});