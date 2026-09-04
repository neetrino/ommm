import * as fs from 'node:fs';
import * as path from 'node:path';

type LoadEhdmCertArgs = {
  certBase64?: string;
  keyBase64?: string;
  certPath?: string;
  keyPath?: string;
};

export function loadEhdmCertAndKey(args: LoadEhdmCertArgs): {
  cert: Buffer;
  key: Buffer;
} {
  const certBase64 = args.certBase64?.trim();
  const keyBase64 = args.keyBase64?.trim();
  if (certBase64 && keyBase64) {
    return {
      cert: decodePemBase64(certBase64, 'EHDM_CERT_BASE64'),
      key: decodePemBase64(keyBase64, 'EHDM_KEY_BASE64'),
    };
  }
  if (certBase64 || keyBase64) {
    throw new Error('EHDM_CERT_BASE64 and EHDM_KEY_BASE64 must both be set');
  }

  const certPath = args.certPath?.trim();
  const keyPath = args.keyPath?.trim();
  if (!certPath || !keyPath) {
    throw new Error('EHDM certificates are not configured');
  }
  return {
    cert: readPemFile(certPath, 'EHDM_CERT_PATH'),
    key: readPemFile(keyPath, 'EHDM_KEY_PATH'),
  };
}

function decodePemBase64(value: string, envName: string): Buffer {
  const decoded = Buffer.from(value.replace(/\s+/g, ''), 'base64');
  assertPem(decoded, envName);
  return decoded;
}

function readPemFile(rawPath: string, envName: string): Buffer {
  const resolved = path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(process.cwd(), rawPath);
  const contents = fs.readFileSync(resolved);
  assertPem(contents, envName);
  return contents;
}

function assertPem(value: Buffer, envName: string): void {
  if (!value.toString('utf8').includes('-----BEGIN ')) {
    throw new Error(`${envName} is not a PEM value`);
  }
}
