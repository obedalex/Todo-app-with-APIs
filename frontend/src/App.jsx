import { useEffect, useState } from "react";
import * as api from "./api.js";
import AddTodo from "./components/AddTodo.jsx";
import TodoItem from "./components/TodoItem.jsx";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.listTodos();
        if (!cancelled) setTodos(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd(title) {
    setError("");
    try {
      const created = await api.createTodo(title);
      setTodos((prev) => [...prev, created]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(todo) {
    setError("");
    setBusyId(todo._id);
    const next = !todo.completed;
    setTodos((prev) =>
      prev.map((t) => (t._id === todo._id ? { ...t, completed: next } : t)),
    );
    try {
      const updated = await api.updateTodo(todo._id, { completed: next });
      setTodos((prev) =>
        prev.map((t) => (t._id === todo._id ? updated : t)),
      );
    } catch (err) {
      setError(err.message);
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todo._id ? { ...t, completed: todo.completed } : t,
        ),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleRename(todo, rawTitle) {
    const title = rawTitle.trim();
    if (!title || title === todo.title) return;

    setError("");
    setBusyId(todo._id);
    setTodos((prev) =>
      prev.map((t) => (t._id === todo._id ? { ...t, title } : t)),
    );
    try {
      const updated = await api.updateTodo(todo._id, { title });
      setTodos((prev) =>
        prev.map((t) => (t._id === todo._id ? updated : t)),
      );
    } catch (err) {
      setError(err.message);
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todo._id ? { ...t, title: todo.title } : t,
        ),
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(todo) {
    setError("");
    setBusyId(todo._id);
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => t._id !== todo._id));
    try {
      await api.deleteTodo(todo._id);
    } catch (err) {
      setError(err.message);
      setTodos(snapshot);
    } finally {
      setBusyId(null);
    }
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <main className="mx-auto w-full max-w-lg">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Todo
          </h1>
          {!loading && !error && todos.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {remaining} of {todos.length} remaining
            </p>
          )}
        </header>

        <AddTodo onAdd={handleAdd} />

        {error && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="shrink-0 font-medium text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        <section className="mt-6">
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">Loading…</p>
          ) : todos.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              Nothing here yet. Add your first todo above.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todos.map((todo) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  busy={busyId === todo._id}
                  onToggle={handleToggle}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
