const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
  warn: (msg) => console.warn(`[${new Date().toISOString()}] WARN: ${msg}`),
  error: (msg, err) =>
    console.error(
      `[${new Date().toISOString()}] ERROR: ${msg}`,
      err?.stack || "",
    ),
};

export default logger;
