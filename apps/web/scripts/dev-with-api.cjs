const { spawn } = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const webDir = path.join(repoRoot, "apps", "web");

const children = [];

function prefixStream(stream, label, writer) {
  if (!stream) {
    return;
  }
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.length > 0) {
        writer.write(`${label} ${line}\n`);
      }
    }
  });
  stream.on("end", () => {
    if (buffer.length > 0) {
      writer.write(`${label} ${buffer}\n`);
    }
  });
}

function run(command, args, cwd, label) {
  const child = spawn(command, args, {
    cwd,
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  prefixStream(child.stdout, label, process.stdout);
  prefixStream(child.stderr, label, process.stderr);
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

console.log("[stack] Starting API + Web (Ctrl+C stops both)\n");
run("pnpm", ["--filter", "api", "dev"], repoRoot, "[api]");
run("pnpm", ["exec", "next", "dev"], webDir, "[web]");
