import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function getAllTodos() {
  const db = getDB();
  const todos = await db.collection("todos").find({}).toArray();
  return todos;
}

export async function getTodoById(id) {
  const db = getDB();
  const todo = await db.collection("todos").findOne({ _id: new ObjectId(id) });
  return todo;
}

export async function createTodo(data) {
  const db = getDB();
  const todo = { date: new Date(), title: data.title, completed: false };
  const result = await db.collection("todos").insertOne(todo);
  return { _id: result.insertedId, ...todo };
}

export async function updateTodo(id, data) {
  const db = getDB();
  const result = await db.collection("todos").updateOne(
    { _id: new ObjectId(id) },
    { $set: { title: data.title, completed: data.completed } }
  );
  return result.matchedCount > 0;
}

export async function deleteTodo(id) {
  const db = getDB();
  const result = await db.collection("todos").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
