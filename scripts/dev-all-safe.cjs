#!/usr/bin/env node
/**
 * Starts API, waits for /v1/health, then starts Web — avoids dev startup races.
 * Usage: node scripts/dev-all-safe.cjs
 */
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const API_PORT = Number(process.env.API_PORT || process.env.PORT || 4000);
const HEALTH_URL = `http://127.0.0.1:${API_PORT}/v1/health`;
const HEALTH_POLL_MS = 500;
const HEALTH_MAX_ATTEMPTS = 120;

function log(message) {
  process.stdout.write(`${message}\n`);
}

function waitForHealth() {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const poll = () => {
      attempts += 1;
      const req = http.get(HEALTH_URL, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
          return;
        }
        retry();
      });
      req.on("error", retry);
      req.setTimeout(2000, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (attempts >= HEALTH_MAX_ATTEMPTS) {
        reject(new Error(`API did not become healthy at ${HEALTH_URL}`));
        return;
      }
      setTimeout(poll, HEALTH_POLL_MS);
    };

    poll();
  });
}

function spawnPnpm(args, label) {
  const child = spawn("pnpm", args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      log(`[dev:all] ${label} stopped (${signal})`);
    } else if (code !== 0 && code !== null) {
      log(`[dev:all] ${label} exited with code ${code}`);
    }
    process.exit(code ?? 0);
  });
  return child;
}

log(`[dev:all] Starting API (port ${API_PORT})…`);
const api = spawn("pnpm", ["dev:api"], {
  cwd: ROOT,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

let webStarted = false;

function shutdown() {
  if (!api.killed) {
    api.kill("SIGTERM");
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

waitForHealth()
  .then(() => {
    if (webStarted) {
      return;
    }
    webStarted = true;
    log("[dev:all] API healthy — starting Web on port 3000…");
    spawnPnpm(["dev:web"], "web");
  })
  .catch((error) => {
    log(`[dev:all] ${error.message}`);
    shutdown();
    process.exit(1);
  });
