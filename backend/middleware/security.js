// Allow the frontend dev server (and anything else during local dev) to call
// the API from a different origin. Set ALLOWED_ORIGIN in .env to lock this down.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

export function security(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "default-src 'none'");

  // CORS
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Answer CORS preflight requests here so they never reach the router.
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
  }
}
