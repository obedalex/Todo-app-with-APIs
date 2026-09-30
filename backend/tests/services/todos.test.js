// tests/services/todos.test.js
process.env.NODE_ENV = "test";

import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";
import { connectDB, closeDB, getDB } from "../../config/db.js";
import {
  createTodo,
  getAllTodos,
  getTodoById,
    updateTodo,
  deleteTodo,
} from "../../services/todo.js";

describe("Todo Service", () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    const db = getDB();
    await db.collection("todos").deleteMany({});
  });
    
    it("creates a todo and returns it with an _id", async () => {
      const todo = await createTodo({ title: "Test todo" });
      assert.ok(todo._id);
      assert.strictEqual(todo.title, "Test todo");
    });

    it("getAllTodos returns an array", async () => {
      await createTodo({ title: "First" });
      await createTodo({ title: "Second" });

      const todos = await getAllTodos();

      assert.ok(Array.isArray(todos));
      assert.strictEqual(todos.length, 2);
    });

    it("getTodoById returns the correct document", async () => {
      const created = await createTodo({ title: "Find me" });

      const fetched = await getTodoById(created._id);

      assert.strictEqual(fetched.title, "Find me");
      assert.strictEqual(fetched._id.toString(), created._id.toString());
    });

  it("updateTodo only changes the specified fields", async () => {
    const created = await createTodo({ title: "Original" });

    const updated = await updateTodo(created._id, { title: "Changed" });

    assert.strictEqual(updated.title, "Changed");
    assert.strictEqual(updated.completed, false);
  });
    
    it("deleteTodo removes the document and returns a truthy result", async () => {
      const created = await createTodo({ title: "To be deleted" });

      const result = await deleteTodo(created._id);
      assert.ok(result);

      const fetched = await getTodoById(created._id);
      assert.strictEqual(fetched, null);
    });
});