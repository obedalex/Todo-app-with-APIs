import http from "node:http";
import { connectDB, closeDB } from "./config/db.js";
import { todoRouter } from "./routes/todo.js";
import { sendJSONResponse } from "./utils/sendJSONResponse.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { PORT } from "./config/env.js";
import { countLimit } from "./middleware/rateLimiter.js";
import { security } from "./middleware/security.js";

const server = http.createServer(async (req, res) => {
  try {
    security(req, res);
    if (res.writableEnded) return;
    countLimit(req, res);
    if (res.writableEnded) return;
    const matched = await todoRouter(req, res);
    if (!res.writableEnded && !matched) {
      sendJSONResponse(
        res,
        404,
        "application/json",
        JSON.stringify({ error: "Not found" }),
      );
    }
  } catch (err) {
    errorHandler(err, req, res);
  }
});

async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    process
      .on("SIGINT", async () => {
        await closeDB();
        process.exit(0);
      })
      
    process.on("SIGTERM", async () => { // FIX: must be `async () =>` because you use `await closeDB()` inside
      console.log("Told to shut down by OS/orchestrator")
      await closeDB();
        process.exit(0);
      });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

startServer();
