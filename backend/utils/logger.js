/**
 * Tiny logging utility.
 *
 * A thin wrapper around `console` that gives every log line a consistent shape:
 *   [2026-09-01T12:34:56.789Z] INFO: server started
 *
 * The goal is just structure and a single choke point for logging — so the app
 * code calls `logger.info(...)` etc. rather than `console.log` directly, and the
 * format (or destination) can be changed later in one place.
 */

/**
 * Format and write one log line.
 *
 * @param {"info"|"warn"|"error"} level  Severity; also decides which console
 *                                       method is used.
 * @param {string} msg  The message to log.
 */
const log = (level, msg) => {
  // ISO timestamp so log lines are sortable and timezone-unambiguous (UTC).
  const timestamp = new Date().toISOString()
  const line = `[${timestamp}] ${level.toUpperCase()}: ${msg}`

  // Route to the matching console method so browser/terminal tooling can filter
  // by severity and errors go to stderr instead of stdout.
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line)
  } else {
    console.log(line);
  }
}

/**
 * Public logging API. Import this instead of using `console` directly.
 *
 * - `info(msg)`  — normal operational messages.
 * - `warn(msg)`  — something unexpected but non-fatal.
 * - `error(msg, err)` — an error. If an Error object is passed as the second
 *   argument, its stack trace is printed on a following line for debugging.
 */
export const logger = {
  info: (msg) => log("info", msg),
  warn: (msg) => log("warn", msg),
  error: (msg, err) => {
    log("error", msg);
    // Only print a stack if we were actually handed an Error-like object.
    if (err?.stack) {
      console.error(err?.stack)
    }
  }
}

export default logger
