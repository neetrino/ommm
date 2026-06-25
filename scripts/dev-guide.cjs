console.log(`
Ommm dev — start API and Web in separate terminals (they connect via .env URLs):

  Terminal 1 — API (port 4000 via API_PORT):
    pnpm dev:api

  Terminal 2 — Web (port 3000):
    pnpm dev:web

Or use the safe combined starter (API first, then Web after /v1/health):
  pnpm dev:all

Start API first, then Web. Web calls http://127.0.0.1:4000 (API_INTERNAL_URL).

Mobile (optional, third terminal):
  pnpm dev:mobile
`);
