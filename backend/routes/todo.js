import * as todoController from "../controllers/todo.js";

export async function todoRouter(req, res) {
  // const url = req.url.endsWith("/") && req.url !== "/" ? req.url.slice(0, -1) : req.url;
  // const { method } = req;
  // const isCollection = url === "/todos";
  // const isItem = url.startsWith("/todos/");
  // const id = isItem ? url.split("/")[2] : null;

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const { method } = req;

  const isCollection = normalizedPath === "/todos";
  const isItem = normalizedPath.startsWith("/todos/");
  const id = isItem ? normalizedPath.split("/")[2] : null;

  if (id) req.params = { id };

  if (isCollection && method === "GET") return todoController.getAllTodos(req, res);
  if (isCollection && method === "POST") return todoController.createTodo(req, res);
  if (isItem && method === "GET") return todoController.getTodoById(req, res);
  if (isItem && method === "PUT") return todoController.updateTodo(req, res);
  if (isItem && method === "DELETE") return todoController.deleteTodo(req, res);

  return null;
}
