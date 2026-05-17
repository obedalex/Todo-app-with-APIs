export function errorHandler(err, req, res) {
  const status = err.statusCode || 500;
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: err.message || "Internal server error" }));
}

// } catch (err) {
//   const error = new Error("Could not read Todos");
//   error.statusCode = 500;
//   throw error;
// }