import { MongoClient } from "mongodb";

const uri = import.meta.MONGO_URI

export async function database() {
    try {
        await client.connect()
    } catch (error) {
        console.log(error)
    }
}