import http from "node:http";
import { parseJSONBody } from "./utils/parseJSONBody.js";
import { sendJSONResponse } from "./utils/sendJSONResponse.js";
import { database } from "./config/data.js";
import { readTodos } from "./utils/readTodos.js";
import { parseId } from "./utils/parseId.js";
import { writeTodos } from "./utils/writeTodos.js";

const PORT = 8000;

const server = http.createServer(async (req, res) => {
  const { url, method } = req;
  const isCollection = url === "/todos";
  const isItem = url.startsWith("/todos/");
  const id = isItem ? url.split("/")[2] : null;

  switch (true) {
    case isCollection && method === "GET":
      try {
        const db = await database();
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
        const db = await database()
        const todo = { date: new Date(), title: data.title, completed: false };
        const result = await db.collection("todos").insertOne(todo);
        const insertedTodo = { _id: result.insertedId, ...todo };
        sendJSONResponse(res, 201, "application/json", JSON.stringify(insertedTodo));
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
      const parsedId = parseId(id);
      if (parsedId === null) {
        sendJSONResponse(
          res,
          400,
          "application/json",
          JSON.stringify({ error: "Invalid ID" }),
        );
      } else {
        const todos = await readTodos();
        const todo = todos.find((t) => t.id === parsedId);
        if (!todo) {
          sendJSONResponse(
            res,
            404,
            "application/json",
            JSON.stringify({ error: "Todo not found" }),
          );
        } else {
          const data = await parseJSONBody(req);
          if (data.title !== undefined) todo.title = data.title;
          if (data.completed !== undefined) todo.completed = data.completed;
          await writeTodos(todos);
          sendJSONResponse(res, 200, "application/json", JSON.stringify(todo));
        }
      }
      break;
    }
    case isItem && method === "DELETE": {
      const parsedId = parseId(id);
      if (parsedId === null) {
        sendJSONResponse(
          res,
          400,
          "application/json",
          JSON.stringify({ error: "Invalid ID" }),
        );
      } else {
        const todos = await readTodos();
        const index = todos.findIndex((t) => t.id === parsedId);
        if (index === -1) {
          sendJSONResponse(
            res,
            404,
            "application/json",
            JSON.stringify({ error: "Todo not found" }),
          );
        } else {
          todos.splice(index, 1);
          await writeTodos(todos);
          res.statusCode = 204;
          res.end();
        }
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
    await database();
    server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

startServer();
