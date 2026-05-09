export async function parseJSONBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk.toString();
  }
  return JSON.parse(body); // throws naturally if invalid — caller handles it
}
