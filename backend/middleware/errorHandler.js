import { logger } from "../utils/logger.js";

/**
 * Centralized error-handling middleware.
 *
 * This is the last handler in the request pipeline. Any error thrown (or passed
 * along) by an earlier route/middleware ends up here so that error responses are
 * formatted in one consistent place instead of being scattered across the app.
 *
 * @param {Error}  err  The error that was raised upstream. If it carries a
 *                       `statusCode` property (e.g. a 404 or 400 we threw on
 *                       purpose), that status is used; otherwise we treat it as
 *                       an unexpected failure and respond with 500.
 * @param {http.IncomingMessage} req  The incoming request, used for logging
 *                                    context (method + URL).
 * @param {http.ServerResponse}  res  The response we write the JSON error to.
 */
export function errorHandler(err, req, res) {
  // Known/expected errors set their own statusCode; anything else is a bug or
  // an unhandled case, so default to 500 (Internal Server Error).
  const status = err.statusCode || 500;

  // Build a single log line with enough context to trace which request failed.
  const fullMessage = `${req.method} ${req.url} ${err.message}`
  // Pass the full error object too so the logger can print the stack trace.
  logger.error(fullMessage, err)

  // Send a minimal JSON error body. We expose `err.message` for client-thrown
  // errors, but fall back to a generic string so internal details don't leak.
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: err.message || "Internal server error" }));
}
