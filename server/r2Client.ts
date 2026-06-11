import { S3Client } from "@aws-sdk/client-s3";

// Shared type for referencing an S3/R2 object — replaces GCS File
export interface R2StorageObject {
  key: string;
}

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
  // Cloudflare R2 does not support AWS SDK v3 checksums — disable them
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export function getBucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET env var is not set");
  return bucket;
}
