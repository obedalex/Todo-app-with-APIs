# Node.js REST API — Complete Roadmap

---

## The Big Picture

When you run your server, Node starts listening on a port. Every time a browser or client sends a request, Node fires your callback with two objects — `req` (what came in) and `res` (what you send back). **That single callback handles every request your server will ever receive.** Your entire job as the developer is to read `req` and decide what to write into `res`.

```
Client                        Your Server
  │                                │
  │  ── POST /todos ────────────►  │
  │                                │  createServer callback fires
  │                                │  you read req.method → "POST"
  │                                │  you read req.url    → "/todos"
  │                                │  you read req body   → { title: "Buy milk" }
  │                                │  you write res
  │  ◄─── 201 { id:1, ... } ────  │
```

---

## The 6 Things You Control on Every Request

```
req.method   → "GET" | "POST" | "PUT" | "DELETE"
req.url      → "/todos" | "/todos/3" | "/anything"
req.body     → not available directly, you must read it from a stream

res.statusCode        → the number you set (200, 201, 404...)
res.setHeader(k, v)   → metadata about your response
res.end(string)       → the actual body sent back, closes the connection
```

Everything else you build is just logic around these six things.

---

## Stage 1 — A Basic Server

**The concept:** `http.createServer()` takes a callback. That callback fires on every single request. `res.end()` must always be called or the client hangs.

**What to do:**
1. Create the server with `http.createServer((req, res) => {})`
2. Inside the callback, set `res.statusCode = 200`
3. Set the header `Content-Type` to `application/json`
4. Call `res.end()` with a `JSON.stringify()` of any object
5. Call `server.listen(PORT, callback)`
6. Run it, open the browser at `localhost:PORT`, confirm you see JSON

**You know this stage is done when:** Any URL you visit returns the same JSON response.

---

## Stage 2 — Routing

**The concept:** Routing is just `if/else` on `req.url` and `req.method`. There is no magic — you are literally checking strings.

**What to do:**
1. Destructure `url` and `method` from `req` at the top of the callback
2. Create two boolean flags — `isCollection` for `/todos` and `isItem` for `/todos/:id`
3. Use a `switch(true)` block to match each route
4. Add a case for `GET /todos` — respond with an empty array `[]`
5. Add stubs for `POST /todos`, `PUT /todos/:id`, `DELETE /todos/:id` with placeholder messages
6. Add a `default` case that returns `404`
7. Test each route in Thunder Client — confirm each one responds differently

**The URL matching pattern for dynamic routes:**
```js
const isCollection = url === "/todos";
const isItem = url.startsWith("/todos/");
const id = isItem ? url.split("/")[2] : null;

// "/todos/3".split("/") → [ "", "todos", "3" ]
//                                           ↑ index 2 is your id
```

**You know this stage is done when:** Each route returns a different placeholder response, and unknown routes return 404.

---

## Stage 3 — Reading the Request Body

**The concept:** The request body is a **stream**. It arrives in chunks over time, not all at once. You must collect chunks until the stream ends, then parse the assembled string.

**What to do:**
1. Make your `createServer` callback `async`
2. Write a `parseJSONBody(req)` utility — mark it `async` and use `for await` to collect chunks
3. In the `POST /todos` case, `await parseJSONBody(req)` to get the parsed object
4. Wrap it in `try/catch` — if parsing fails, respond with `400`
5. On success, echo the received data back in the response for now
6. Test with Thunder Client — send a POST with a JSON body and confirm the server echoes it back

**The parseJSONBody pattern:**
```js
export async function parseJSONBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk.toString();
  }
  return JSON.parse(body); // throws naturally if invalid — caller handles it
}
```

**Why async:** Node is non-blocking. Rather than pausing everything to wait for the full body,
it fires events as data arrives. `for await` lets you write this in a clean, readable way.

**You know this stage is done when:** You can POST with a JSON body using Thunder Client and your server echoes back the parsed object.

---

## Stage 4 — File I/O as Your Database

**The concept:** You'll store todos in a `todos.json` file. `fs.readFile` reads it asynchronously. `fs.writeFile` writes it back. Use the `promises` API to avoid deeply nested callbacks.

**What to do:**
1. Create a `todos.json` file with an empty array `[]`
2. Import `fs/promises` at the top of your server
3. Write a `readTodos()` helper that reads and parses `todos.json`
4. Write a `writeTodos(todos)` helper that stringifies and writes the array back
5. In `GET /todos`, call `readTodos()` and respond with the array
6. In `POST /todos`, read todos → push new todo → write back → respond with new todo
7. Restart the server, create a todo, restart again, and `GET /todos` — it should still be there

**The helper pattern:**
```js
import { readFile, writeFile } from "node:fs/promises";

const DB_PATH = "./todos.json";

async function readTodos() {
  const data = await readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeTodos(todos) {
  await writeFile(DB_PATH, JSON.stringify(todos, null, 2));
}
```

**The flow for every mutating route:**
```
readTodos() → modify the array → writeTodos() → send response
```

**You know this stage is done when:** You can create a todo, restart the server, and GET /todos still returns it — because it's saved to disk.

---

## Stage 5 — Dynamic URLs and ID Extraction

**The concept:** A URL like `/todos/3` is just a string. You split it to get the ID, then use it to find the right item in your array.

**What to do:**
1. The `id` variable from Stage 2 (`url.split("/")[2]`) is your starting point
2. Parse it to a number with `parseInt(id)` and validate with `isNaN()`
3. For `PUT /todos/:id` — read todos, find by id, update fields, write back, respond
4. For `DELETE /todos/:id` — read todos, find index, splice it out, write back, respond `204`
5. If the id is not found in the array, respond with `404`

**Always validate the ID first:**
```js
const parsedId = parseInt(id);
if (isNaN(parsedId)) {
  sendJSONResponse(res, 400, "application/json", JSON.stringify({ error: "Invalid ID" }));
  return;
}
```

**You know this stage is done when:** `DELETE /todos/1` removes only that todo. `PUT /todos/1` updates only that todo. Invalid IDs return 400. Missing IDs return 404.

---

## Stage 6 — Status Codes and Headers Done Right

**The concept:** Status codes are your API's vocabulary. They tell the client exactly what happened without them reading the body.

**The ones you must use:**

| Code | Meaning          | When to use                        |
|------|------------------|------------------------------------|
| 200  | OK               | Successful GET or PUT              |
| 201  | Created          | Successful POST                    |
| 204  | No Content       | Successful DELETE — no body needed |
| 400  | Bad Request      | Missing fields, bad JSON           |
| 404  | Not Found        | ID doesn't exist                   |
| 500  | Server Error     | Unexpected crash                   |

**What to do:**
1. Go through every route and confirm the status code matches the outcome
2. For `DELETE`, use `204` and call `res.end()` with no body
3. For `POST`, use `201`
4. For missing required fields (like no `title`), respond `400` before doing anything else
5. Wrap file operations in `try/catch` and respond `500` for unexpected failures

**You know this stage is done when:** Every route returns the correct status code for both success and failure cases.

---

## The Checklist for Every Route You Write

```
□ Check req.method and req.url correctly
□ For POST/PUT: await parseJSONBody(req) inside try/catch
□ Validate input — return 400 early if something is missing or wrong
□ Read from todos.json before doing anything with data
□ Perform the operation (find, push, splice, modify)
□ Write back to todos.json if data changed
□ Set the correct status code
□ Call res.end() with JSON.stringify — always, on every code path
```

> **The one rule that ties it all together:**
> Read `req` to understand the intent. Write `res` to fulfill it. Always call `res.end()`.

---

## HTTP Methods Quick Reference

| Operation | Method   | URL          | Body needed? | Success code |
|-----------|----------|--------------|--------------|--------------|
| Read all  | `GET`    | `/todos`     | No           | 200          |
| Read one  | `GET`    | `/todos/:id` | No           | 200          |
| Create    | `POST`   | `/todos`     | Yes          | 201          |
| Update    | `PUT`    | `/todos/:id` | Yes          | 200          |
| Delete    | `DELETE` | `/todos/:id` | No           | 204          |

---

## Next Steps After Stage 6

Once all six stages are complete and working:

1. **Add a real database** — swap `todos.json` for SQLite or MongoDB
2. **Add validation** — check for required fields on every mutating route
3. **Add error handling middleware** — centralize your `try/catch` logic
4. **Add authentication** — protect routes with JWT tokens
5. **Learn Express** — you'll now understand exactly what it does for you under the hood
6. **Deploy** — host your API on Render or Railwaycd backedn