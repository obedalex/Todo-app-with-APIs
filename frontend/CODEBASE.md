# Frontend codebase

A minimal **React 19 + Vite 7 + Tailwind v4** single-page app that is a thin
client over the Todo REST API. No router, no state library, no TypeScript — one
screen, plain `fetch`, local component state.

## Tech stack

| Piece | Version | Notes |
| --- | --- | --- |
| React | ^19.1 | `react` + `react-dom`, function components + hooks only |
| Vite | ^7.0 | dev server + build, `@vitejs/plugin-react` |
| Tailwind CSS | ^4.1 | via `@tailwindcss/vite` plugin, config lives in CSS (`@theme`) |

Scripts (`package.json`): `npm run dev` (Vite dev server on 5173),
`npm run build`, `npm run preview`.

## File map

```
frontend/
├── .env                     VITE_API_URL — backend base URL
├── index.html               Vite entry, mounts #root, loads /src/main.jsx
├── vite.config.js           React + Tailwind plugins, dev port 5173
├── src/
│   ├── main.jsx             ReactDOM.createRoot → <App /> in <StrictMode>
│   ├── index.css            Tailwind import + @theme tokens (accent color, font)
│   ├── api.js               ★ all backend communication
│   ├── App.jsx              ★ all state + data flow, top-level UI
│   └── components/
│       ├── AddTodo.jsx      create form (controlled input + submit)
│       └── TodoItem.jsx     one row: checkbox, inline-editable title, date, edit/delete
```

Two files carry the weight: `api.js` (talks to the server) and `App.jsx`
(holds state and orchestrates everything). The two components are presentational
— they receive callbacks and call them.

## Data flow

```
App (owns `todos`, `loading`, `error`, `busyId`)
 │
 ├── on mount ──────────► api.listTodos() ──► GET /todos
 │
 ├── <AddTodo onAdd> ───► handleAdd ──► api.createTodo(title) ──► POST /todos
 │
 └── <TodoItem …> per todo
       ├── onToggle ────► handleToggle ─► api.updateTodo(id,{completed}) ─► PUT /todos/:id
       ├── onRename ────► handleRename ─► api.updateTodo(id,{title})     ─► PUT /todos/:id
       └── onDelete ────► handleDelete ─► api.deleteTodo(id)            ─► DELETE /todos/:id
```

All server state lives in `App.jsx` as a single `todos` array. There is no
cache layer and no global store — a refresh re-fetches from scratch.

### Optimistic updates

`handleToggle`, `handleRename`, and `handleDelete` update local state
immediately, then call the API, then either replace the item with the server's
response or **roll back** to the previous value on error (capturing a `snapshot`
for delete, or the prior field value for toggle/rename). `handleAdd` is not
optimistic — it waits for the created record so it has a real `_id`.

`busyId` holds the `_id` of the row currently mid-request so `TodoItem` can
disable its controls.

## `src/api.js` — the API layer

- `BASE_URL` = `import.meta.env.VITE_API_URL || "http://localhost:8000"`, with
  any trailing slash stripped.
- `request(path, options)` is the one place `fetch` is called:
  - always sends `Content-Type: application/json`
  - network failure → `Error("Could not reach the API at … Is it running?")`
  - `204 No Content` → returns `null`
  - parses JSON; on `!res.ok` throws `Error(body.error || "Request failed (NNN)")`
    — i.e. it unwraps the API's `{ error: string }` shape into a thrown Error
    that `App.jsx` catch blocks put in the `error` banner.
- Exported endpoint functions: `listTodos`, `getTodo`, `createTodo`,
  `updateTodo`, `deleteTodo`. `getTodo` is exported for completeness though no
  screen currently uses it.

### Backend contract assumptions

- Todos have `_id`, `title`, `completed`, and `date` (Mongo-style document).
- List endpoint returns a bare array (`App.jsx` guards with `Array.isArray`).
- Errors come back as `{ error: "message" }` with a non-2xx status.
- `DELETE` returns 204 (or any body-less 2xx).

## Backend integration & CORS

**There is no CORS code in the frontend** — CORS is entirely server-side.
The frontend integration surface is just:

1. **`.env` → `VITE_API_URL`** — the only configuration. Point it at wherever
   the API runs. Vite inlines `import.meta.env.VITE_*` at build time.
2. **`src/api.js`** — every request originates here. No `fetch` calls exist
   anywhere else.
3. **No Vite dev proxy.** `vite.config.js` only sets the port. The browser
   calls `http://localhost:8000` directly from `http://localhost:5173`, which
   is a cross-origin request — so it works *only* because the backend sends
   CORS headers.

Those headers are set in **`backend/middleware/security.js`**:

```js
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
// OPTIONS preflight is answered with 204 before reaching the router
```

If you deploy the frontend to a real domain, set `ALLOWED_ORIGIN` in the
backend `.env` to that domain (instead of `*`).

### If cross-origin ever becomes a problem

Add a proxy to `vite.config.js` so the browser only ever talks to the Vite
origin:

```js
server: {
  port: 5173,
  proxy: { "/todos": "http://localhost:8000" },
}
```

…then set `VITE_API_URL=""` (or drop the host from paths) so requests are
same-origin. Not currently needed — the backend CORS headers cover local dev.

## Styling

Tailwind v4, configured in CSS not JS. `src/index.css` does
`@import "tailwindcss"` and defines theme tokens in an `@theme` block:
`--color-accent` / `--color-accent-hover` (used as `bg-accent`, `text-accent`,
`accent-accent`, etc.) and the sans font stack. All other styling is utility
classes inline in JSX.

## Adding a feature — where things go

| Task | Touch |
| --- | --- |
| New endpoint call | add an export to `src/api.js` |
| New server-state behavior | a handler in `App.jsx` + state there |
| New row control | `src/components/TodoItem.jsx` + a callback prop from `App.jsx` |
| Change API location | `frontend/.env` (`VITE_API_URL`) |
| Change allowed origin | backend `.env` (`ALLOWED_ORIGIN`), not here |
| Theme color / font | `@theme` block in `src/index.css` |
