process.env.NODE_ENV = "test";

import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert";
import http from "node:http";
import { server, startServer } from "../../server.js";
import { getDB } from "../../config/db.js";
import { PORT } from "../../config/env.js";

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: PORT,
      path,
      method,
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const parsed = data ? JSON.parse(data) : {};
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

describe("Todo Routes", () => {
  before(async () => {
    await startServer();
  });

  after(async () => {
    server.close();
  });

  beforeEach(async () => {
    const db = getDB();
    await db.collection("todos").deleteMany({});
  });

  it("POST /todos creates a todo", async () => {
    const res = await makeRequest("POST", "/todos", { title: "Test todo" });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body._id);
    assert.strictEqual(res.body.title, "Test todo");
  });

  it("GET /todos returns all todos", async () => {
    await makeRequest("POST", "/todos", { title: "First" });
    await makeRequest("POST", "/todos", { title: "Second" });

    const res = await makeRequest("GET", "/todos");

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 2);
  });

  it("GET /todos/:id returns the correct todo", async () => {
    const created = await makeRequest("POST", "/todos", { title: "Find me" });
    const id = created.body._id;

    const res = await makeRequest("GET", `/todos/${id}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.title, "Find me");
  });

  it("GET /todos/:id returns 404 for a missing todo", async () => {
    const fakeId = "64f000000000000000000000"; // valid ObjectId format, but won't exist

    const res = await makeRequest("GET", `/todos/${fakeId}`);

    assert.strictEqual(res.status, 404);
  });

  it("PUT /todos/:id updates only the specified fields", async () => {
    const created = await makeRequest("POST", "/todos", { title: "Original" });
    const id = created.body._id;

    const res = await makeRequest("PUT", `/todos/${id}`, {
      title: "Changed",
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.title, "Changed");
    assert.strictEqual(res.body.completed, false);
  });

it("DELETE /todos/:id removes the todo", async () => {
  const created = await makeRequest("POST", "/todos", {
    title: "To be deleted",
  });
  const id = created.body._id;

  const deleteRes = await makeRequest("DELETE", `/todos/${id}`);
  assert.strictEqual(deleteRes.status, 204);

  const getRes = await makeRequest("GET", `/todos/${id}`);
  assert.strictEqual(getRes.status, 404);
});
});
