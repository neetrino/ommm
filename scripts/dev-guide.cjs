console.log(`
Ommm local development — start API and Web in separate terminals:

  Terminal 1 — API (port 4000, API_PORT in .env):
    pnpm dev:api

  Terminal 2 — Web (port 3000):
    pnpm dev:web

Start API first, then Web. Web proxies to the API via API_INTERNAL_URL (http://127.0.0.1:4000).

If ports 3000 or 4000 are stuck from a previous session:
  npx kill-port 3000 4000

Health checks (after both are running):
  API:  http://localhost:4000/v1/health
  Web:  http://localhost:3000/api/v1/health

Mobile (optional, third terminal):
  pnpm dev:mobile
`);
