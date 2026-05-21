const requestCounts = new Map();

export function countLimit(req, res) {
    const ip = req.socket.remoteAddress;

    const count = requestCounts.get(ip) || 0;
    const newCount = count + 1;

    requestCounts.set(ip, newCount);

    if (newCount > 100) {
        res.statusCode = 429;
        res.end(JSON.stringify({ error: "Too many requests" }));
        return;
    }
}