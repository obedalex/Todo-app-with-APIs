# Todo — frontend

Minimal React + Vite + Tailwind v4 client for the Todo REST API.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The API base URL is read from `VITE_API_URL` (see `.env`), defaulting to
`http://localhost:8000`. The backend must be running and reachable — it now
sends CORS headers so the dev server on port 5173 can call it.

## What it does

- `GET /todos` on load, with loading / empty / error states
- Add a todo — single input + **Add** button (`POST /todos`)
- Toggle a todo's checkbox (`PUT /todos/:id` with `{ completed }`), optimistic
- Rename a todo — **Edit** button or double-click the title (`PUT /todos/:id` with
  `{ title }`); Enter/blur saves, Escape cancels
- Delete a todo (`DELETE /todos/:id`), optimistic with rollback on failure
- Failed requests surface the API's `{ error }` message in a dismissible banner

`src/api.js` also exports `getTodo(id)` for `GET /todos/:id`, covering the full
route table even though the list view has no detail screen that needs it.

## Structure

| File | Role |
| --- | --- |
| `src/api.js` | fetch wrapper, unwraps `{ error }`, handles 204 |
| `src/App.jsx` | state, data flow, loading/empty/error UI |
| `src/components/AddTodo.jsx` | create form |
| `src/components/TodoItem.jsx` | one row: checkbox, inline-editable title, date, edit/delete |
