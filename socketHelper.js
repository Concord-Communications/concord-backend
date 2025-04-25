const port = process.env.PORT || 8080;
const sock = new WebSocket(`ws://localhost:${port}`);
