import http from "node:http";
import { parseJSONBody } from "./utils/parseJSONBody.js";
import { sendJSONResponse } from "./utils/sendJSONResponse.js";
import { connectDB, getDB } from "./config/db.js";
import { ObjectId } from "mongodb";

const PORT = 8000;

const server = http.createServer(async (req, res) => {
  const { url, method } = req;
  const cleanUrl = url.endsWith("/") && url !== "/" ? url.slice(0, -1) : url;
  const isCollection = cleanUrl === "/todos";
  const isItem = cleanUrl.startsWith("/todos/");
  const id = isItem ? cleanUrl.split("/")[2] : null;

  switch (true) {
    case isCollection && method === "GET":
      try {
        const db = getDB();
        const todos = await db.collection("todos").find({}).toArray();
        sendJSONResponse(res, 200, "application/json", JSON.stringify(todos));
      } catch (error) {
        sendJSONResponse(
          res,
          500,
          "application/json",
          JSON.stringify({ error: "Could not read todos" }),
        );
      }
      break;

    case isItem && method === "GET":
      try {
        const db = getDB();
        const todo = await db
          .collection("todos")
          .findOne({ _id: new ObjectId(id) });
        if (!todo) {
          sendJSONResponse(
            res,
            404,
            "application/json",
            JSON.stringify({ error: "todo not found" }),
          );
          return;
        }
        sendJSONResponse(res, 200, "application/json", JSON.stringify(todo));
      } catch (error) {
        sendJSONResponse(
          res,
          400,
          "application/json",
          JSON.stringify({ error: "Invalid ID format" }),
        );
      }
      break;

    case isCollection && method === "POST":
      try {
        const data = await parseJSONBody(req);

        if (!data.title) {
          sendJSONResponse(
            res,
            400,
            "application/json",
            JSON.stringify({ error: "Title is required" }),
          );
          break;
        }
        const db = getDB();
        const todo = { date: new Date(), title: data.title, completed: false };
        const result = await db.collection("todos").insertOne(todo);
        const insertedTodo = { _id: result.insertedId, ...todo };
        sendJSONResponse(
          res,
          201,
          "application/json",
          JSON.stringify(insertedTodo),
        );
      } catch (err) {
        sendJSONResponse(
          res,
          400,
          "application/json",
          JSON.stringify({ error: err.message }),
        );
      }
      break;

    case isItem && method === "PUT": {
      try {
        // 1. get db
        const db = getDB();
        // 2. parse request body
        const body = await parseJSONBody(req);
        console.log("body:", body);
        console.log("id:", id);
        console.log("ObjectId:", new ObjectId(id));
        // 3. call updateOne with ObjectId filter and $set
        const result = await db
          .collection("todos")
          .updateOne(
            { _id: new ObjectId(id) },
            { $set: { title: body.title, completed: body.completed } },
          );
        // 4. check result.matchedCount — if 0, respond 404
        if (result.matchedCount === 0) {
          sendJSONResponse(
            res,
            404,
            "application/json",
            JSON.stringify({ error: "Not found" }),
          );
          return;
        }
        // 5. respond 200 with success
        sendJSONResponse(
          res,
          200,
          "application/json",
          JSON.stringify({
            message: "Todo updated successfully",
          }),
        );
      } catch (error) {
        console.log(error);
        // invalid ObjectId format → respond 400
        sendJSONResponse(
          res,
          400,
          "application/json",
          JSON.stringify({ error: "Invalid ID" }),
        );
      }
      break;
    }

    //DELETE handler
    case isItem && method === "DELETE": {
      try {
        const db = getDB();
        const result = await db
          .collection("todos")
          .deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          sendJSONResponse(
            res,
            404,
            "application/json",
            JSON.stringify({ error: "Not found" }),
          );
          return;
        }
        res.statusCode = 204;
        res.end();
      } catch (error) {
        console.log(error);
        sendJSONResponse(
          res,
          400,
          "application/json",
          JSON.stringify({ error: "Invalid ID" }),
        );
      }
      break;
    }

    default:
      sendJSONResponse(
        res,
        404,
        "application/json",
        JSON.stringify({ error: "Not found" }),
      );
      break;
  }
});

async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

startServer();
