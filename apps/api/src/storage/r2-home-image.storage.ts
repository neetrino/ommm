import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

function normalizePublicBase(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function objectKeyFromPublicUrl(
  storedUrl: string,
  publicBase: string,
): string | null {
  const base = normalizePublicBase(publicBase);
  const u = storedUrl.trim();
  if (!u.startsWith(base)) {
    return null;
  }
  const rest = u.slice(base.length).replace(/^\/+/, "");
  return rest.length > 0 ? rest : null;
}

/**
 * Cloudflare R2 via S3-compatible API. Used for user Home banner images.
 * Requires `R2_PUBLIC_URL`, bucket, credentials, and endpoint (explicit or via `R2_ACCOUNT_ID`).
 */
@Injectable()
export class R2HomeImageStorage implements OnModuleInit {
  private readonly logger = new Logger(R2HomeImageStorage.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    if (this.isConfigured()) {
      this.logger.log("Home banner uploads: Cloudflare R2 (S3 API) is enabled.");
      return;
    }
    const missing = this.listMissingR2Env();
    this.logger.warn(
      `Home banner uploads: R2 is not active (missing or empty: ${missing.join(", ")}). ` +
        "Images will fall back to local disk unless you set all R2_* variables.",
    );
  }

  /** True when bucket, credentials, public URL, and endpoint can be resolved. */
  isConfigured(): boolean {
    return this.resolveR2() !== null;
  }

  /** Non-secret hints for logs / support (no values). */
  listMissingR2Env(): string[] {
    const missing: string[] = [];
    if (!this.config.get<string>("R2_BUCKET_NAME")?.trim()) {
      missing.push("R2_BUCKET_NAME");
    }
    if (!this.config.get<string>("R2_ACCESS_KEY_ID")?.trim()) {
      missing.push("R2_ACCESS_KEY_ID");
    }
    if (!this.config.get<string>("R2_SECRET_ACCESS_KEY")?.trim()) {
      missing.push("R2_SECRET_ACCESS_KEY");
    }
    if (!this.config.get<string>("R2_PUBLIC_URL")?.trim()) {
      missing.push("R2_PUBLIC_URL");
    }
    const endpoint =
      this.config.get<string>("R2_S3_ENDPOINT")?.trim() ??
      this.config.get<string>("R2_ACCOUNT_ID")?.trim();
    if (!endpoint) {
      missing.push("R2_S3_ENDPOINT or R2_ACCOUNT_ID");
    }
    return missing;
  }

  async putObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<string> {
    const ctx = this.resolveR2();
    if (!ctx) {
      throw new Error("R2 is not configured");
    }
    const key = params.key.replace(/^\/+/, "");
    await ctx.client.send(
      new PutObjectCommand({
        Bucket: ctx.bucket,
        Key: key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
    return `${ctx.publicBase}/${key}`;
  }

  /** Deletes object only if `storedUrl` starts with configured `R2_PUBLIC_URL`. */
  async deleteObjectIfOwned(storedUrl: string): Promise<void> {
    const ctx = this.resolveR2();
    if (!ctx) {
      return;
    }
    const key = objectKeyFromPublicUrl(storedUrl, ctx.publicBase);
    if (!key || key.includes("..")) {
      return;
    }
    try {
      await ctx.client.send(
        new DeleteObjectCommand({
          Bucket: ctx.bucket,
          Key: key,
        }),
      );
    } catch (err) {
      this.logger.warn(
        `R2 delete failed (${key}): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private resolveR2(): {
    client: S3Client;
    bucket: string;
    publicBase: string;
  } | null {
    const bucket = this.config.get<string>("R2_BUCKET_NAME")?.trim();
    const accessKeyId = this.config.get<string>("R2_ACCESS_KEY_ID")?.trim();
    const secretAccessKey = this.config
      .get<string>("R2_SECRET_ACCESS_KEY")
      ?.trim();
    const publicRaw = this.config.get<string>("R2_PUBLIC_URL")?.trim();
    const endpoint =
      this.config.get<string>("R2_S3_ENDPOINT")?.trim() ??
      ((): string | undefined => {
        const accountId = this.config.get<string>("R2_ACCOUNT_ID")?.trim();
        return accountId
          ? `https://${accountId}.r2.cloudflarestorage.com`
          : undefined;
      })();

    if (
      !bucket ||
      !endpoint ||
      !accessKeyId ||
      !secretAccessKey ||
      !publicRaw
    ) {
      return null;
    }

    const publicBase = normalizePublicBase(publicRaw);
    const client = new S3Client({
      region: "auto",
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return { client, bucket, publicBase };
  }
}
