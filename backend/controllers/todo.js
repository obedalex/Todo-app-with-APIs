import * as todoService from "../services/todo.js";
import { sendJSONResponse } from "../utils/sendJSONResponse.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { validateCreateTodo } from "../validators/todo.js";
import { validateUpdateTodo } from "../validators/todo.js";



export async function getAllTodos(req, res) {
  try {
    const todos = await todoService.getAllTodos();
    sendJSONResponse(res, 200, "application/json", JSON.stringify(todos));
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  return true;
}

export async function getTodoById(req, res) {
  try {
    const { id } = req.params;
    const todo = await todoService.getTodoById(id);
    if (!todo) {
      sendJSONResponse(
        res,
        404,
        "application/json",
        JSON.stringify({ error: "Todo not found" }),
      );
      return;
    }
    sendJSONResponse(res, 200, "application/json", JSON.stringify(todo));
  } catch (err) {
    err.statusCode = 400;
    throw err;
  }
  return true;
}

export async function createTodo(req, res) {
  try {
    
    // FIX 1 (order): parse the body FIRST. You can't validate something that
    // hasn't been parsed yet, and referencing `body` before its `const`
    // declaration throws ReferenceError (temporal dead zone), not undefined.
    const body = await parseJSONBody(req);

    // FIX 2 (then validate): now `body` exists, so the validator has something
    // real to inspect.
    const { valid, message } = validateCreateTodo(body);

    // FIX 3 (short-circuit): add `return` after sending the 400. Without it,
    // execution falls through to the success path below and you call
    // sendJSONResponse a second time -> ERR_HTTP_HEADERS_SENT.
    if (!valid) {
      sendJSONResponse(
        res,
        400,
        "application/json",
        JSON.stringify({ error: message }),
      );
      return;
    }

    // --- current (broken) code below; remove once the fixes above are applied ---
   
    const todo = await todoService.createTodo(body);
    sendJSONResponse(res, 201, "application/json", JSON.stringify(todo));
  } catch (err) {
    err.statusCode = 400;
    throw err;
  }
  return true;
}

export async function updateTodo(req, res) {
  try {
 
    // FIX (missing validator call): `valid` is referenced but never declared
    // here. The validator call itself is missing -- you have the check but not
    // the thing that produces the value. Same pattern as createTodo:
    //   1) parse  2) validate  3) return-on-invalid  4) proceed.
    //
    const { id } = req.params;
    const body = await parseJSONBody(req);
    const { valid, message } = validateUpdateTodo(body); // import this too
    if (!valid) {
      sendJSONResponse(
        res,
        400,
        "application/json",
        JSON.stringify({ error: message }),
      );
      return; // <- short-circuit, otherwise double-response
    }

    // --- current (broken) code below ---
    const updated = await todoService.updateTodo(id, body);
    if (!updated) {
      sendJSONResponse(
        res,
        404,
        "application/json",
        JSON.stringify({ error: "Not found" }),
      );
      return;
    }
    sendJSONResponse(
      res,
      200,
      "application/json",
      JSON.stringify({ message: "Todo updated successfully" }),
    );
  } catch (err) {
    err.statusCode = 400;
    throw err;
  }
  return true;
}

export async function deleteTodo(req, res) {
  try {
    const { id } = req.params;
    const deleted = await todoService.deleteTodo(id);
    if (!deleted) {
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
  } catch (err) {
    err.statusCode = 400;
    throw err;
  }
  return true;

  // FIX (unreachable): this `return false;` is dead code -- the `return true;`
  // above always runs first. Either delete this line, or if the intent was to
  // signal "not handled" you'd need to restructure so it's actually reachable.
}
