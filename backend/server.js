import http from "node:http";
import { sendJSONResponse } from "./utils/sendJSONResponse.js";

const PORT = 8000;

const server = http.createServer((req, res) => {
  const { url, method } = req; //destructured the req
  const isCollection = url === "/todos" //If the url starts with the entire collection
  const isItem = url.startsWith("/todos/") //If the url starts with a specific collection

  switch (true) {
    case isCollection && method === "GET":
      sendJSONResponse(res, 200, "application/json", JSON.stringify([]))
      break;
    case isCollection && method === "POST":
      sendJSONResponse(res, 201, "application/json", JSON.stringify({ message: "POST stub" }));
      break;

    case isItem && method === "PUT":
      sendJSONResponse(res, 200, "application/json", JSON.stringify({ message: "PUT stub" }));
      break;

    case isItem && method === "DELETE":
      sendJSONResponse(res, 200, "application/json", JSON.stringify({ message: "DELETE stub" }));
      break;

    default:
      sendJSONResponse(res, 404, "application/json", JSON.stringify({ error: "Not found" }));
      break;
  }
});

server.listen(PORT, () => console.log(`Connected on port: ${PORT}`));
