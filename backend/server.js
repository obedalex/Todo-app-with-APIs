import http from "node:http";
import { connectDB, closeDB } from "./config/db.js";
import { todoRouter } from "./routes/todo.js";
import { sendJSONResponse } from "./utils/sendJSONResponse.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { PORT } from "./config/env.js";

const server = http.createServer(async (req, res) => {
  try {
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
    process.on("SIGINT", async () => {
      await closeDB();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

startServer();
