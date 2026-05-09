import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export async function connectDB() {
  await client.connect();
}

export function getDB() {
  return client.db("todo-api");
}
