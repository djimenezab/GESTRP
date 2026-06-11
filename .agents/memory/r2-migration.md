---
name: R2 object storage migration
description: Object storage migrated from Replit GCS (objectStorage.ts) to Cloudflare R2 via AWS S3 SDK. Key files and conventions.
---

## Rule
All file uploads/downloads use Cloudflare R2 via `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`. The GCS `@google-cloud/storage` client and Replit sidecar are no longer used.

**Why:** App moved from Replit to Render; Replit Object Storage (GCS-backed sidecar) is unavailable outside Replit.

## Key files
- `server/r2Client.ts` — S3Client singleton + `getBucket()` helper + `R2StorageObject` type. Single source of truth for credentials.
- `server/objectStorage.ts` — `ObjectStorageService` class, same public API as before.
- `server/objectAcl.ts` — ACL stored as S3 object metadata (HeadObject to read, CopyObject-to-self to write).

## Environment variables required on Render
- `R2_ENDPOINT` — must be the ACCOUNT-level endpoint: `https://<account-id>.r2.cloudflarestorage.com` (NOT bucket-specific)
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`

## Path conventions
- Upload key pattern: `uploads/<uuid>` in the R2 bucket.
- Download URL served by Express: `GET /objects/uploads/<uuid>`
- DB always stores `/objects/uploads/<uuid>` (canonical path).

## Upload flow — CRITICAL
`POST /api/objects/upload` returns `{ uploadURL, objectPath }`.
- `uploadURL` → Uppy/fetch uses it to PUT the file directly to R2.
- `objectPath` (e.g. `/objects/uploads/<uuid>`) → stored in DB as-is. NEVER parse the uploadURL to derive the path.
- **Why:** `forcePathStyle: true` embeds the bucket name in the URL path. If R2_ENDPOINT is bucket-specific the bucket appears twice as the key. Returning `objectPath` from the server side-steps all URL parsing entirely.

## Checksum fix
S3Client is configured with `requestChecksumCalculation: "WHEN_REQUIRED"` and `responseChecksumValidation: "WHEN_REQUIRED"` to stop the AWS SDK v3 from adding checksum headers that Cloudflare R2 rejects. `getSignedUrl` also passes `unhoistableHeaders` to exclude checksum headers from the presigned PUT URL.

## Frontend ref pattern for objectPath
Every component that uploads files stores the server-provided `objectPath` in a `useRef` (single file) or `useRef<Map<string, string>>` (multi-file with Uppy file IDs), and uses that ref in the `onComplete` callback — never `file.uploadURL`.

## Uppy peer dep
`@uppy/drag-drop@^4` must be installed alongside `@uppy/core@^4`, `@uppy/dashboard@^4`, `@uppy/react@^4`. Version 5 of drag-drop is incompatible with v4 of the others.
