import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../todos.json");

export async function writeTodos(todos) {
  await fs.writeFile(DB_PATH, JSON.stringify(todos, null, 2));
}
