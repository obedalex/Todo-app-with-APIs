# MongoDB Native Driver Integration — Roadmap

---

## The Big Picture

You've already built a working REST API with file-based persistence. This roadmap covers swapping that out for MongoDB. The shape of your route handlers won't change much — what changes is *where* the data comes from and how you interact with it.

```
Before:  route handler → todos.json (file)
After:   route handler → db.collection("todos") (MongoDB)
```

Your `db.js` connection setup is already done. Everything from here is about using that `db` instance inside your routes.

---

## Stage 5 — GET /todos (Read All)

**The concept:** `.find()` is MongoDB's way of fetching multiple documents from a collection. Unlike reading a file and parsing JSON, `.find()` returns a **cursor** — a pointer to the results, not the results themselves. You need to resolve it into an array before you can send it.

**What to do:**
1. Import your `database` function into your server/routes file
2. At the top of the handler, call `await database()` to get the `db` instance
3. Access your collection with `db.collection("todos")`
4. Call `.find({})` on it — the empty object means "match everything"
5. Chain `.toArray()` to resolve the cursor into a plain array
6. Send that array as your JSON response

**The pattern:**
```js
const db = await database();
const todos = await db.collection("todos").find({}).toArray();
```

**Why `.toArray()`?** MongoDB streams results for efficiency — especially useful for large datasets. `.toArray()` collects all streamed documents into memory at once. For a todo app this is fine; for millions of records you'd process the cursor differently.

**You know this stage is done when:** `GET /todos` returns an empty array `[]` and you can see the `todos` collection appear in MongoDB Compass after the first request.

---

## Stage 6 — POST /todos (Create)

**The concept:** `.insertOne()` adds a single document to a collection. MongoDB automatically generates a unique `_id` field for every document — you don't create or manage IDs yourself.

**What to do:**
1. Parse the request body as you already do
2. Validate that `title` exists — return `400` if missing
3. Build your todo object from the request body
4. Call `.insertOne(todo)` on your collection
5. The result contains an `insertedId` — use it to confirm what was created
6. Respond `201` with the inserted document

**The pattern:**
```js
const result = await db.collection("todos").insertOne(todo);
// result.insertedId holds the new MongoDB _id
```

**Why not set your own ID?** MongoDB's `ObjectId` is a 12-byte identifier that encodes a timestamp, machine ID, and counter. It's globally unique without needing a central counter. You can set your own `_id` if you want, but there's rarely a good reason to.

**You know this stage is done when:** A `POST` creates a document visible in Compass with an auto-generated `_id`.

---

## Stage 7 — GET /todos/:id (Read One)

**The concept:** This is the most conceptually important stage. MongoDB IDs are not plain strings — they are `ObjectId` instances. If you pass a raw string to a query, MongoDB won't find anything because the types don't match. You must convert the string from the URL into an `ObjectId` first.

**What to do:**
1. Extract the `id` string from the URL as you already do
2. Import `ObjectId` from the `mongodb` package
3. Wrap the id string in `new ObjectId(id)` before querying
4. Wrap that conversion in a `try/catch` — an invalid string will throw
5. Use `.findOne({ _id: new ObjectId(id) })` to fetch the document
6. If the result is `null`, respond `404`

**The pattern:**
```js
import { MongoClient, ObjectId } from "mongodb";

// inside the handler:
const todo = await db.collection("todos").findOne({ _id: new ObjectId(id) });
if (!todo) { /* respond 404 */ }
```

**Why does this matter?** This is the #1 mistake people make with MongoDB. The URL gives you a string like `"6849a1..."`. MongoDB stores `ObjectId("6849a1...")`. They look identical but are different types — the query silently returns nothing without the conversion.

**You know this stage is done when:** `GET /todos/:id` with a valid id returns the document, an invalid id format returns `400`, and a valid-format-but-missing id returns `404`.

---

## Stage 8 — PUT /todos/:id (Update)

**The concept:** `.updateOne()` modifies a document matching a filter. MongoDB uses **update operators** — you don't pass the replacement document directly, you pass instructions describing what to change. The most common is `$set`, which updates only the specified fields without touching the rest.

**What to do:**
1. Convert the id string to `ObjectId` as in Stage 7
2. Parse the request body to get the fields being updated
3. Call `.updateOne()` with the filter and a `$set` update operator
4. Check `result.matchedCount` — if `0`, the document wasn't found, respond `404`
5. Fetch and return the updated document, or construct the response from what you know

**The pattern:**
```js
const result = await db.collection("todos").updateOne(
  { _id: new ObjectId(id) },
  { $set: { title: body.title, completed: body.completed } }
);
```

**Why `$set` instead of just passing the object?** Without `$set`, you'd replace the entire document. `$set` does a surgical update — only the fields you specify change, everything else stays intact. MongoDB has many update operators (`$inc`, `$push`, `$unset`) — `$set` is the one you'll use 90% of the time.

**You know this stage is done when:** `PUT /todos/:id` updates only the fields you send, without wiping fields you didn't include.

---

## Stage 9 — DELETE /todos/:id (Delete)

**The concept:** `.deleteOne()` removes the first document matching a filter. It returns a result object telling you how many documents were actually deleted — which is how you distinguish "deleted successfully" from "nothing matched."

**What to do:**
1. Convert the id to `ObjectId`
2. Call `.deleteOne({ _id: new ObjectId(id) })`
3. Check `result.deletedCount` — if `0`, respond `404`
4. On success, respond `204` with no body

**The pattern:**
```js
const result = await db.collection("todos").deleteOne({ _id: new ObjectId(id) });
if (result.deletedCount === 0) { /* respond 404 */ }
```

**Why check `deletedCount`?** `.deleteOne()` doesn't throw an error if nothing was found — it just reports `deletedCount: 0`. This is MongoDB's way of handling "not found" on deletes. If you don't check it, every delete appears successful even when the id doesn't exist.

**You know this stage is done when:** Deleting an existing id removes it from Compass and returns `204`. Deleting a non-existent id returns `404`.

---

## Stage 10 — End-to-End Testing

**The concept:** Before calling the integration complete, verify the full lifecycle works and that your data looks correct in Compass.

**What to do:**
1. `POST` a new todo — confirm it appears in Compass with `_id`, `title`, `completed: false`
2. `GET /todos` — confirm it's in the list
3. `GET /todos/:id` — use the `_id` from Compass to fetch it directly
4. `PUT /todos/:id` — update `completed` to `true`, confirm change in Compass
5. `DELETE /todos/:id` — confirm it disappears from Compass
6. Test all error cases: missing fields, invalid ids, non-existent ids

**What to look for in Compass:** Your documents should look like this:
```json
{
  "_id": ObjectId("..."),
  "title": "Buy groceries",
  "completed": false
}
```

**You know this stage is done when:** The full CRUD lifecycle works end-to-end, Compass reflects every change in real time, and all error cases return the correct status codes.

---

## The Checklist for Every MongoDB Route

```
□ Call await database() to get the db instance
□ Convert :id string to ObjectId — wrap in try/catch
□ Use the right method: findOne, find, insertOne, updateOne, deleteOne
□ Check the result — null, matchedCount, deletedCount
□ Respond 404 when a document isn't found
□ Respond 400 for invalid ObjectId format
□ Always respond — no code path should leave the client hanging
```

---

## MongoDB Methods Quick Reference

| Operation   | Method          | Key result field  | Success code |
|-------------|-----------------|-------------------|--------------|
| Read all    | `.find({}).toArray()` | —           | 200          |
| Read one    | `.findOne(filter)`    | `null` if missing | 200     |
| Create      | `.insertOne(doc)`     | `insertedId`  | 201          |
| Update      | `.updateOne(filter, {$set})` | `matchedCount` | 200 |
| Delete      | `.deleteOne(filter)`  | `deletedCount` | 204         |

---

## Stage 11 — Refactor into Layers

**The concept:** Right now your routing, HTTP logic, and database queries all live together. This works but doesn't scale — every time you need to change something, you're hunting through one large file. Separating into layers means each file has exactly one job, and a change in one layer doesn't ripple into the others.

The three layers you're introducing:

```
routes/todos.js       → "this URL calls this controller function"
controllers/todos.js  → "read req, call service, send res"
services/todos.js     → "talk to MongoDB, return data"
```

**What to do:**

1. Create the folder structure first — `routes/`, `controllers/`, `services/`

2. **Start with the service layer** — move all your MongoDB queries here. Each function takes plain arguments (not `req`) and returns plain data (not `res`). Example signature:
    ```js
    export async function getAllTodos() { ... }
    export async function getTodoById(id) { ... }
    export async function createTodo(data) { ... }
    export async function updateTodo(id, data) { ... }
    export async function deleteTodo(id) { ... }
    ```

3. **Build the controller layer next** — each function receives `req` and `res`, extracts what it needs, calls the relevant service function, and sends the response. Controllers should contain no MongoDB code whatsoever:
    ```js
    export async function getAllTodos(req, res) {
        const todos = await todoService.getAllTodos();
        // send response
    }
    ```

4. **Build the routes layer last** — this should be the thinnest layer. Just map URLs to controller functions. No logic, no db calls, no req/res manipulation:
    ```js
    // GET /todos → controller.getAllTodos
    // POST /todos → controller.createTodo
    ```

5. **Update `server.js`** — it should now only do three things: connect to the database, register routes, and start listening. Nothing else.

**The test for good separation:** Cover each layer with this question:
- Service function: does it mention `req`, `res`, or status codes? If yes, move that logic up to the controller.
- Controller function: does it contain any MongoDB methods like `.find()` or `.insertOne()`? If yes, move that logic down to the service.
- Route file: does it contain anything other than URL-to-function mappings? If yes, it belongs elsewhere.

**Why service layer before controller?** Because services have no dependencies on the layers above them — they just take data and return data. Building them first means you can test them in isolation before wiring up HTTP concerns.

**You know this stage is done when:** Your `server.js` has no MongoDB code, your service files have no `req`/`res` references, and all CRUD operations still work exactly as before — the refactor changes structure, not behaviour.

---

## Project Structure After Stage 11

```
todo-api/
├── config/
│   └── db.js              ← MongoDB connection
├── routes/
│   └── todos.js           ← URL mappings only
├── controllers/
│   └── todos.js           ← HTTP logic (req/res)
├── services/
│   └── todos.js           ← MongoDB queries + business logic
├── .env                   ← environment variables
└── server.js              ← startup only
```

---

## Stage 12 — Input Validation

**The concept:** Right now your API trusts whatever the client sends. Validation is the gate that rejects bad data before it ever reaches your service layer or database. It lives in its own `validators/` folder and is called from the controller — after parsing the body, before calling the service.

**What to do:**
1. Create `validators/todos.js`
2. Write a `validateCreateTodo(data)` function that checks: `title` exists, is a string, and is not empty after trimming
3. Write a `validateUpdateTodo(data)` function that checks: at least one valid field is present, types are correct (`completed` must be a boolean if provided)
4. Return a structured error from validators — not `res`, just a plain object like `{ valid: false, message: "Title is required" }`
5. In your controller, call the validator first — if `valid` is false, respond `400` with the message immediately
6. Only call the service if validation passes

**The pattern:**
```js
// validators/todos.js
export function validateCreateTodo(data) {
  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    return { valid: false, message: "Title must be a non-empty string" };
  }
  return { valid: true };
}

// in controller:
const { valid, message } = validateCreateTodo(body);
if (!valid) { /* respond 400 with message */ }
```

**Why a separate validators folder?** Controllers would get cluttered fast if they contained all validation logic. Validators are also easy to unit test independently — you just call the function with different inputs and check the result.

**You know this stage is done when:** Sending a `POST` with no title, an empty title, or a wrong type returns a clear `400` with a descriptive message before anything touches the database.

---

## Stage 13 — Centralized Error Handling

**The concept:** Right now every route has its own `try/catch` and formats errors differently. Centralized error handling means errors are thrown from anywhere and caught in one place, formatted consistently, and logged once. This is a middleware function that sits at the end of your request pipeline.

**What to do:**
1. Create `middleware/errorHandler.js`
2. Write a function that accepts `(err, req, res)` — the error, plus the usual request and response objects
3. Inside it, determine the status code — if `err.statusCode` exists use it, otherwise default to `500`
4. Send a consistent JSON error shape: `{ error: err.message }`
5. In your controllers, replace scattered `try/catch` blocks with a single pattern — catch errors and either set a `statusCode` on them or just rethrow
6. Register the error handler in `server.js` as the last thing in your middleware chain

**The pattern:**
```js
// middleware/errorHandler.js
export function errorHandler(err, req, res) {
  const status = err.statusCode || 500;
  res.statusCode = status;
  res.end(JSON.stringify({ error: err.message || "Internal server error" }));
}

// throwing a handled error from a controller or service:
const error = new Error("Todo not found");
error.statusCode = 404;
throw error;
```

**Why set `statusCode` on the error object?** It lets the error carry its own HTTP meaning without the error handler needing to know what kind of error it was. A 404 from a missing todo and a 400 from bad input both bubble up the same way — the status code travels with the error.

**You know this stage is done when:** Removing individual `try/catch` blocks from controllers doesn't break error responses — they still return the correct status codes and a consistent JSON shape.

---

## Stage 14 — Environment Configuration & Graceful Shutdown

**The concept:** Two related concerns. First, your app should validate that required environment variables exist at startup — failing loudly with a clear message is better than failing silently mid-request. Second, when your server process is stopped, it should close the MongoDB connection cleanly rather than just dropping it.

**What to do:**

**Environment config (`config/env.js`):**
1. Create `config/env.js`
2. Read all required variables from `process.env`
3. Check that none are undefined — if any are missing, throw an error with the variable name
4. Export the validated values as named constants
5. Import from `config/env.js` everywhere instead of using `process.env` directly

```js
// config/env.js
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;

if (!MONGO_URI) throw new Error("Missing required env variable: MONGO_URI");
if (!PORT) throw new Error("Missing required env variable: PORT");

export { MONGO_URI, PORT };
```

**Graceful shutdown (`server.js`):**
1. Keep a reference to your `MongoClient` instance accessible in `server.js`
2. Listen for `SIGINT` (Ctrl+C) and `SIGTERM` (process manager stop signal)
3. In the handler: close the server, close the MongoDB client, then exit with code `0`

```js
process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
```

**Why validate env at startup?** A missing `MONGO_URI` discovered at request time means your app starts, appears healthy, then fails on the first real request. Failing at startup makes the problem immediately obvious and prevents a broken app from ever accepting traffic.

**You know this stage is done when:** Starting the server with a missing `.env` variable exits immediately with a clear error message. Stopping the server with Ctrl+C logs a clean shutdown without connection errors.

---

## Stage 15 — Security & Rate Limiting

**The concept:** Two lightweight protections every API should have. Security headers tell browsers and clients how to handle your responses safely. Rate limiting prevents a single client from overwhelming your API with requests.

**What to do:**

**Security headers (`middleware/security.js`):**
1. Create `middleware/security.js`
2. Write a middleware function that sets these headers on every response:
    - `X-Content-Type-Options: nosniff` — prevents browsers from guessing content type
    - `X-Frame-Options: DENY` — prevents your API responses being embedded in iframes
    - `Content-Security-Policy: default-src 'none'` — appropriate for a pure JSON API
3. Register it in `server.js` so it runs on every request before routing

**Rate limiting (`middleware/rateLimiter.js`):**
1. Create a simple in-memory store that tracks request counts per IP address
2. Set a window (e.g. 15 minutes) and a max requests per window (e.g. 100)
3. On each request, increment the counter for that IP
4. If the counter exceeds the limit, respond `429 Too Many Requests` before the request reaches routing
5. Reset counters after the time window expires

**Why in-memory for rate limiting?** For a single-server todo app, in-memory is fine. In a multi-server production environment you'd use a shared store like Redis so all servers see the same counters — but that's beyond scope here.

**You know this stage is done when:** Security headers appear on every response (check in browser DevTools → Network tab). Sending more than your limit of requests within the window returns `429`.

---

## Stage 16 — Logging

**The concept:** `console.log` has no structure — every log looks the same regardless of severity, and there's no timestamp or context. A simple logger adds severity levels, timestamps, and consistent formatting without requiring a heavy library.

**What to do:**
1. Create `utils/logger.js`
2. Write a logger with at least three levels: `info`, `warn`, `error`
3. Each log entry should include: timestamp, level, and message
4. For `error` level, also log the stack trace if an error object is passed
5. Use the logger in your error handler, your `startServer` function, and anywhere you currently have `console.log`

**The pattern:**
```js
// utils/logger.js
const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
  warn: (msg) => console.warn(`[${new Date().toISOString()}] WARN: ${msg}`),
  error: (msg, err) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`, err?.stack || ""),
};

export default logger;
```

**Why ISO timestamps?** They're sortable, unambiguous across timezones, and parseable by log aggregation tools if you ever ship logs to an external service.

**You know this stage is done when:** Every significant event (server start, DB connection, errors, unhandled requests) produces a structured log line with a timestamp and level. No raw `console.log` calls remain outside of `logger.js`.

---

## Stage 17 — Testing

**The concept:** Tests verify your code does what you think it does — and keeps doing it after you change things. The layered architecture from Stage 11 makes testing straightforward: service functions are pure data logic with no HTTP concerns, so you can call them directly and assert on the results.

**What to do:**

1. Install a test runner — Node's built-in `node:test` module works without any dependencies:
    ```bash
    # no install needed, it's built into Node 18+
    ```

2. Create `tests/services/todos.test.js` — test each service function directly:
    - `getAllTodos` returns an array
    - `createTodo` inserts and returns a document with an `_id`
    - `getTodoById` returns the correct document
    - `updateTodo` only changes the specified fields
    - `deleteTodo` removes the document and returns a truthy result

3. Create `tests/routes/todos.test.js` — test the full HTTP layer using Node's `http` module to make real requests against a running test server

4. Use a **separate test database** — add a `MONGO_URI_TEST` variable to your `.env` and connect to it during tests so you never touch real data

5. Add a `beforeEach` that clears the todos collection before each test so tests don't interfere with each other

**The pattern for service tests:**
```js
import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { createTodo, getAllTodos } from "../../services/todos.js";

describe("Todo Service", () => {
  it("creates a todo and returns it with an _id", async () => {
    const todo = await createTodo({ title: "Test todo" });
    assert.ok(todo._id);
    assert.strictEqual(todo.title, "Test todo");
  });
});
```

**Why test services before routes?** Services are the core logic — if they're wrong, everything built on top is wrong. Testing them in isolation also runs faster since there's no HTTP overhead.

**You know this stage is done when:** Running your test suite exercises every CRUD operation, all tests pass against a clean test database, and a deliberate bug in a service function causes at least one test to fail.

---

## Final Project Structure

```
todo-api/
├── config/
│   ├── db.js                  ← MongoDB connection
│   └── env.js                 ← environment variable validation
├── controllers/
│   └── todos.js               ← HTTP logic (req/res)
├── middleware/
│   ├── errorHandler.js        ← centralized error formatting
│   ├── rateLimiter.js         ← request throttling
│   └── security.js            ← security headers
├── routes/
│   └── todos.js               ← URL mappings only
├── services/
│   └── todos.js               ← MongoDB queries + business logic
├── tests/
│   ├── services/
│   │   └── todos.test.js
│   └── routes/
│       └── todos.test.js
├── utils/
│   └── logger.js              ← structured logging
├── validators/
│   └── todos.js               ← input validation rules
├── .env
└── server.js                  ← startup + graceful shutdown
```