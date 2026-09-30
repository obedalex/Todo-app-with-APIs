import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import { MONGO_URI } from "./env.js";
import { logger } from "../utils/logger.js";

const isTest = process.env.NODE_ENV === "test";
const uri = isTest ? process.env.MONGO_URI_TEST : MONGO_URI;

const client = new MongoClient(uri);
let db;

export async function connectDB() {
  await client.connect();
  db = client.db();
  logger.info(`Connected to MongoDB (${db.databaseName})`);
  return db;
}

export function getDB() {
  return db;
}

export async function closeDB() {
  await client.close();
}
