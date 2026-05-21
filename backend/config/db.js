import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import { MONGO_URI } from "./env.js";


const client = new MongoClient(MONGO_URI); // FIX: was `uri` — that variable doesn't exist. Use `MONGO_URI` which you imported above.

export async function connectDB() {
  await client.connect();
}

export function getDB() {
  return client.db("todo-api");
}

export async function closeDB() {
      await client.close();
    }

