// lib/r2.js
// Generates short-lived signed GET URLs for private R2 objects.
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const DEFAULT_EXPIRES_SECONDS = 2 * 60 * 60; // 2 hours — covers a long lesson with seeking

let _client = null;

// Shared S3 client for R2. Built on first call, so importing this module reads no env.
// Used by signUrl below and by scripts/upload-videos.js.
export function r2Client() {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  return _client;
}

export async function signUrl(r2Key, expiresIn = DEFAULT_EXPIRES_SECONDS) {
  const cmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: r2Key });
  return getSignedUrl(r2Client(), cmd, { expiresIn });
}
