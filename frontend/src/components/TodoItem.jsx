import { useEffect, useRef, useState } from "react";

const dateFmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : dateFmt.format(d);
}

export default function TodoItem({ todo, busy, onToggle, onRename, onDelete }) {
  const created = formatDate(todo.date);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraft(todo.title);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    onRename(todo, draft);
  }

  function cancel() {
    setEditing(false);
    setDraft(todo.title);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") cancel();
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <input
        type="checkbox"
        checked={todo.completed}
        disabled={busy || editing}
        onChange={() => onToggle(todo)}
        aria-label={`Mark "${todo.title}" as ${
          todo.completed ? "not completed" : "completed"
        }`}
        className="size-5 shrink-0 accent-accent disabled:opacity-40"
      />

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            aria-label={`Edit "${todo.title}"`}
            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        ) : (
          <p
            onDoubleClick={startEditing}
            title="Double-click to edit"
            className={`truncate ${
              todo.completed ? "text-gray-400 line-through" : "text-gray-900"
            }`}
          >
            {todo.title}
          </p>
        )}
        {created && !editing && (
          <p className="mt-0.5 text-xs text-gray-400">{created}</p>
        )}
      </div>

      {editing ? (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={commit}
          className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          Save
        </button>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          disabled={busy}
          aria-label={`Edit "${todo.title}"`}
          className="shrink-0 rounded-md px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
        >
          Edit
        </button>
      )}

      <button
        type="button"
        onClick={() => onDelete(todo)}
        disabled={busy || editing}
        aria-label={`Delete "${todo.title}"`}
        className="shrink-0 rounded-md px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      >
        Delete
      </button>
    </li>
  );
}
