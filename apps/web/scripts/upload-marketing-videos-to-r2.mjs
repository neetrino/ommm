import { createReadStream, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = join(scriptDir, "..");
const monorepoRoot = join(webRoot, "..", "..");
const assetsDir = join(webRoot, "assets/marketing/home/hero");

loadEnv({ path: join(monorepoRoot, ".env"), quiet: true });
loadEnv({ path: join(monorepoRoot, ".env.local"), override: true, quiet: true });

/** Local filename → R2 object key (must match home-hero-banner-tokens.ts). */
const MARKETING_VIDEO_UPLOADS = [
  {
    fileName: "home-hero-intro.webm",
    objectKey: "marketing/home/hero/home-hero-intro.webm",
    contentType: "video/webm",
    required: false,
  },
  {
    fileName: "home-hero-intro-mobile.webm",
    objectKey: "marketing/home/hero/home-hero-intro-mobile.webm",
    contentType: "video/webm",
    required: true,
  },
  {
    fileName: "home-hero-intro-mobile.mp4",
    objectKey: "marketing/home/hero/home-hero-intro-mobile.mp4",
    contentType: "video/mp4",
    required: true,
  },
  {
    fileName: "home-hero-logo-mark.mp4",
    objectKey: "marketing/home/hero/home-hero-logo-mark.mp4",
    contentType: "video/mp4",
    required: true,
  },
];

const CACHE_CONTROL = "public, max-age=31536000, immutable";

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function resolveS3Endpoint() {
  const explicit = process.env.R2_S3_ENDPOINT?.trim();
  if (explicit) {
    return explicit;
  }
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  if (accountId) {
    return `https://${accountId}.r2.cloudflarestorage.com`;
  }
  throw new Error("Set R2_S3_ENDPOINT or R2_ACCOUNT_ID");
}

function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: resolveS3Endpoint(),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

async function uploadFile(client, bucket, entry) {
  const localPath = join(assetsDir, entry.fileName);
  if (!existsSync(localPath)) {
    if (entry.required) {
      throw new Error(`Required video not found: ${localPath}`);
    }
    console.log(`Skip (optional, missing): ${entry.fileName}`);
    return;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: entry.objectKey,
      Body: createReadStream(localPath),
      ContentType: entry.contentType,
      CacheControl: CACHE_CONTROL,
    }),
  );

  const publicBase = requireEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
  console.log(`Uploaded ${entry.fileName} → ${publicBase}/${entry.objectKey}`);
}

async function main() {
  const bucket = requireEnv("R2_BUCKET_NAME");
  requireEnv("R2_PUBLIC_URL");
  const client = createR2Client();

  for (const entry of MARKETING_VIDEO_UPLOADS) {
    await uploadFile(client, bucket, entry);
  }

  console.log("Marketing hero videos upload complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
