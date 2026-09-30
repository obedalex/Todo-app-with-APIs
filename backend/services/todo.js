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
  const changes = {};
  if (data.title !== undefined) changes.title = data.title;
  if (data.completed !== undefined) changes.completed = data.completed;

  const result = await db
    .collection("todos")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: changes },
      { returnDocument: "after" },
    );
  return result;
}

export async function deleteTodo(id) {
  const db = getDB();
  const result = await db.collection("todos").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
