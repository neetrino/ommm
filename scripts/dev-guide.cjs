console.log(`
Ommm dev — start API and Web in separate terminals (they connect via .env URLs):

  Terminal 1 — API (port 4000):
    pnpm dev:api

  Terminal 2 — Web (port 3000):
    pnpm dev:web

Start API first, then Web. Web calls http://localhost:4000 (NEXT_PUBLIC_API_URL / API_INTERNAL_URL).

Mobile (optional, third terminal):
  pnpm dev:mobile
`);
