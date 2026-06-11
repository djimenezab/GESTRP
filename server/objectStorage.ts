import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";
import { s3Client, getBucket } from "./r2Client";
import type { R2StorageObject } from "./r2Client";
export type { R2StorageObject };
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  // Generate a presigned PUT URL for a new upload.
  // Returns BOTH the signed URL (for the browser PUT) and the canonical
  // /objects/… path that must be stored in the database.
  // Never parse the upload URL on the frontend — use objectPath directly.
  async getObjectEntityUploadURL(): Promise<{ uploadURL: string; objectPath: string }> {
    const bucket = getBucket();
    const uuid = randomUUID();
    const key = `uploads/${uuid}`;
    const objectPath = `/objects/${key}`;
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key });
    // Exclude checksum headers — Cloudflare R2 rejects them and causes ERR_CONNECTION_RESET
    const uploadURL = await getSignedUrl(s3Client, cmd, {
      expiresIn: 900,
      unhoistableHeaders: new Set([
        "x-amz-checksum-crc32",
        "x-amz-checksum-crc32c",
        "x-amz-checksum-sha1",
        "x-amz-checksum-sha256",
        "x-amz-sdk-checksum-algorithm",
      ]),
    });
    return { uploadURL, objectPath };
  }

  // Resolve /objects/uploads/{uuid} → R2StorageObject, verifying it exists
  async getObjectEntityFile(objectPath: string): Promise<R2StorageObject> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const key = objectPath.slice("/objects/".length);
    if (!key) {
      throw new ObjectNotFoundError();
    }
    const bucket = getBucket();
    try {
      await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    } catch (err: any) {
      if (err instanceof NoSuchKey || err?.name === "NotFound" || err?.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundError();
      }
      throw err;
    }
    return { key };
  }

  // Build R2StorageObject without existence check (for writing)
  createObjectEntityFile(objectPath: string): R2StorageObject {
    if (!objectPath.startsWith("/objects/")) {
      throw new Error("Invalid object path");
    }
    const key = objectPath.slice("/objects/".length);
    return { key };
  }

  // Stream object to HTTP response
  async downloadObject(obj: R2StorageObject, res: Response, cacheTtlSec: number = 3600) {
    const bucket = getBucket();
    try {
      const result = await s3Client.send(
        new GetObjectCommand({ Bucket: bucket, Key: obj.key })
      );

      let cacheVisibility = "private";
      try {
        const aclPolicy = await getObjectAclPolicy(obj);
        if (aclPolicy?.visibility === "public") {
          cacheVisibility = "public";
        }
      } catch {
        // Silently ignore ACL errors — serve as private
      }

      const headers: Record<string, string> = {
        "Cache-Control": `${cacheVisibility}, max-age=${cacheTtlSec}`,
      };
      if (result.ContentType) headers["Content-Type"] = result.ContentType;
      if (result.ContentLength !== undefined) {
        headers["Content-Length"] = String(result.ContentLength);
      }
      res.set(headers);

      const body = result.Body as NodeJS.ReadableStream;
      body.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      body.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  // Convert a raw presigned R2 URL (or legacy GCS URL) to /objects/{key}
  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath) return rawPath;

    // Already a normalized /objects/... path
    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }

    // Handle R2 presigned/public URLs:
    // https://<account>.r2.cloudflarestorage.com/<bucket>/<key>?...
    try {
      const url = new URL(rawPath);
      if (url.hostname.endsWith(".r2.cloudflarestorage.com")) {
        const bucket = getBucket();
        // pathname = /<bucket>/<key>  (path-style)
        const prefix = `/${bucket}/`;
        const pathname = url.pathname;
        if (pathname.startsWith(prefix)) {
          const key = pathname.slice(prefix.length);
          return `/objects/${key}`;
        }
        // If bucket not in path, just strip leading slash
        return `/objects/${pathname.slice(1)}`;
      }

      // Legacy Replit/GCS URLs
      if (url.hostname === "storage.googleapis.com") {
        const rawObjectPath = url.pathname;
        const privateDir = process.env.PRIVATE_OBJECT_DIR;
        if (privateDir) {
          const entityDir = privateDir.endsWith("/") ? privateDir : `${privateDir}/`;
          const bucketPart = entityDir.split("/")[1];
          const prefix = `/${bucketPart}/`;
          if (rawObjectPath.startsWith(prefix)) {
            const key = rawObjectPath.slice(prefix.length);
            return `/objects/${key}`;
          }
        }
        return rawPath;
      }
    } catch {
      // Not a valid URL — return as-is
    }

    return rawPath;
  }

  // Set ACL policy on an already-uploaded object, return normalized path
  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/objects/")) {
      return normalizedPath;
    }
    try {
      const obj = await this.getObjectEntityFile(normalizedPath);
      await setObjectAclPolicy(obj, aclPolicy);
    } catch {
      // Non-fatal — path saved even if ACL update fails
    }
    return normalizedPath;
  }

  // Check whether a user may access the object
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: R2StorageObject;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}
