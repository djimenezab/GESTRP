import { S3Client } from "@aws-sdk/client-s3";

// Shared type for referencing an S3/R2 object — replaces GCS File
export interface R2StorageObject {
  key: string;
}

/**
 * Normalizes the R2 endpoint by stripping the bucket name suffix if it has
 * been included in the URL path.
 *
 * Some configurations set R2_ENDPOINT to a bucket-specific URL such as:
 *   https://<account>.r2.cloudflarestorage.com/<bucket>
 *
 * With forcePathStyle:true the SDK appends /<bucket>/<key> to the endpoint,
 * resulting in a double-bucket path that causes 404s for correctly-keyed
 * objects. Stripping the suffix makes the SDK construct the correct URL:
 *   https://<account>.r2.cloudflarestorage.com/<bucket>/<key>
 */
function normalizeR2Endpoint(endpoint: string | undefined, bucket: string): string | undefined {
  if (!endpoint) return endpoint;
  const suffix = `/${bucket}`;
  return endpoint.endsWith(suffix) ? endpoint.slice(0, -suffix.length) : endpoint;
}

export function getBucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET env var is not set");
  return bucket;
}

const _bucket = process.env.R2_BUCKET ?? "";
const _endpoint = normalizeR2Endpoint(process.env.R2_ENDPOINT, _bucket);

export const s3Client = new S3Client({
  region: "auto",
  endpoint: _endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
  // Cloudflare R2 does not support AWS SDK v3 checksums — disable them
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});
