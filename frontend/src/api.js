// Base URL for all API calls.
// Uses the VITE_API_URL env var if set (e.g. in production), otherwise falls
// back to the local dev server. The trailing slash is stripped so paths can be
// concatenated cleanly as `${BASE_URL}${path}`.
const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

/**
 * Wrapper around fetch that unwraps the API's JSON shape and turns
 * `{ error: string }` responses into thrown Errors.
 */
async function request(path, options = {}) {
  let res;
  try {
    // Send the request. Every call defaults to JSON content type; callers can
    // override or extend the options (method, body, headers, etc.).
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch only rejects on network-level failures (server down, DNS, CORS),
    // so translate that into a friendly, actionable message.
    throw new Error(`Could not reach the API at ${BASE_URL}. Is it running?`);
  }

  // 204 No Content has no body to parse (e.g. successful DELETE).
  if (res.status === 204) return null;
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  // Non-2xx status: surface the API's `error` field if present, otherwise a
  // generic message that includes the HTTP status code.
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }

  // Success: return the parsed JSON payload to the caller.
  return body;
}

// --- Endpoint helpers -------------------------------------------------------
// Each function maps to one REST route and returns a promise resolving to the
// parsed response body (or rejecting with an Error via `request`).

// GET /todos — fetch all todos.
export const listTodos = () => request("/todos");

// GET /todos/:id — fetch a single todo by id.
export const getTodo = (id) => request(`/todos/${id}`);

// POST /todos — create a new todo with the given title.
export const createTodo = (title) =>
  request("/todos", { method: "POST", body: JSON.stringify({ title }) });

// PUT /todos/:id — update a todo; `patch` holds the fields to change
// (e.g. { title } or { completed }).
export const updateTodo = (id, patch) =>
  request(`/todos/${id}`, { method: "PUT", body: JSON.stringify(patch) });

// DELETE /todos/:id — remove a todo by id.
export const deleteTodo = (id) =>
  request(`/todos/${id}`, { method: "DELETE" });
