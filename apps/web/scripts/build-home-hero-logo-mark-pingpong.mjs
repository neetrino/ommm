import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegStatic from "ffmpeg-static";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = join(scriptDir, "..");
const inputPath = join(
  webRoot,
  "public/marketing/home/hero/home-hero-logo-mark-source.mp4",
);
const legacyInputPath = join(webRoot, "public/marketing/home/hero/home-hero-logo-mark.mp4");
const outputPath = join(webRoot, "public/marketing/home/hero/home-hero-logo-mark.mp4");

const sourcePath = existsSync(inputPath) ? inputPath : legacyInputPath;

if (!ffmpegStatic) {
  throw new Error("ffmpeg-static binary is unavailable.");
}

if (!existsSync(sourcePath)) {
  throw new Error(`Source video not found: ${sourcePath}`);
}

/** Forward + reversed clip — one seamless ping-pong cycle for native `loop` playback. */
const filter =
  "[0:v]split=2[fwd][tmp];[tmp]reverse[rev];[fwd][rev]concat=n=2:v=1:a=0[out]";

execFileSync(
  ffmpegStatic,
  [
    "-i",
    sourcePath,
    "-filter_complex",
    filter,
    "-map",
    "[out]",
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-y",
    outputPath,
  ],
  { stdio: "inherit" },
);

console.log(`Wrote ping-pong hero logo mark video: ${outputPath}`);
