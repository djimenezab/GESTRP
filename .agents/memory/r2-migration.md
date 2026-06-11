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
- `R2_ENDPOINT` — e.g. `https://<account-id>.r2.cloudflarestorage.com`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`

## Path conventions
- Upload key pattern: `uploads/<uuid>` in the R2 bucket.
- Download URL served by Express: `GET /objects/uploads/<uuid>`
- `normalizeObjectEntityPath()` converts R2 presigned PUT URLs (`https://<account>.r2.cloudflarestorage.com/<bucket>/uploads/<uuid>?...`) → `/objects/uploads/<uuid>` for DB storage.

## Uppy peer dep
`@uppy/drag-drop@^4` must be installed alongside `@uppy/core@^4`, `@uppy/dashboard@^4`, `@uppy/react@^4`. Version 5 of drag-drop is incompatible with v4 of the others.
