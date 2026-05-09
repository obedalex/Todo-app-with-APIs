import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGO_URI
const client = new MongoClient(uri)

export async function database() {
    try {
        const db = await client.connect()
        return client.db("todo-api");
    } catch (error) {
        console.log(error)
    }
}