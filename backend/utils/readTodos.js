import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../todos.json");

export async function readTodos() {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}
