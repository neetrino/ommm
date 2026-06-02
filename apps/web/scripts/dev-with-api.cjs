const { spawn } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const webDir = path.join(repoRoot, "apps", "web");

const children = [];

function run(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });
  children.push(child);
  child.on("exit", (code) => {
    if (code !== null && code !== 0) {
      shutdown(code);
    }
  });
  return child;
}

function shutdown(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

run("pnpm", ["--filter", "api", "dev"], repoRoot);
run("pnpm", ["exec", "next", "dev"], webDir);
