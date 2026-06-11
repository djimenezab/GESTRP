import {
  HeadObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client, getBucket } from "./r2Client";
import type { R2StorageObject } from "./r2Client";
export type { R2StorageObject };

const ACL_POLICY_METADATA_KEY = "aclpolicy";

export enum ObjectAccessGroupType {}

export interface ObjectAccessGroup {
  type: ObjectAccessGroupType;
  id: string;
}

export enum ObjectPermission {
  READ = "read",
  WRITE = "write",
}

export interface ObjectAclRule {
  group: ObjectAccessGroup;
  permission: ObjectPermission;
}

export interface ObjectAclPolicy {
  owner: string;
  visibility: "public" | "private";
  aclRules?: Array<ObjectAclRule>;
}

function isPermissionAllowed(
  requested: ObjectPermission,
  granted: ObjectPermission,
): boolean {
  if (requested === ObjectPermission.READ) {
    return [ObjectPermission.READ, ObjectPermission.WRITE].includes(granted);
  }
  return granted === ObjectPermission.WRITE;
}

abstract class BaseObjectAccessGroup implements ObjectAccessGroup {
  constructor(
    public readonly type: ObjectAccessGroupType,
    public readonly id: string,
  ) {}
  public abstract hasMember(userId: string): Promise<boolean>;
}

function createObjectAccessGroup(group: ObjectAccessGroup): BaseObjectAccessGroup {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}

// Store ACL policy as S3 object metadata.
// S3/R2 requires copying the object to itself to update metadata.
export async function setObjectAclPolicy(
  obj: R2StorageObject,
  aclPolicy: ObjectAclPolicy,
): Promise<void> {
  const bucket = getBucket();
  const encodedValue = encodeURIComponent(JSON.stringify(aclPolicy));
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: obj.key,
      CopySource: `${bucket}/${obj.key}`,
      MetadataDirective: "REPLACE",
      Metadata: {
        [ACL_POLICY_METADATA_KEY]: encodedValue,
      },
    })
  );
}

// Read ACL policy from S3 object metadata.
export async function getObjectAclPolicy(
  obj: R2StorageObject,
): Promise<ObjectAclPolicy | null> {
  const bucket = getBucket();
  const result = await s3Client.send(
    new HeadObjectCommand({ Bucket: bucket, Key: obj.key })
  );
  const raw = result.Metadata?.[ACL_POLICY_METADATA_KEY];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export async function canAccessObject({
  userId,
  objectFile,
  requestedPermission,
}: {
  userId?: string;
  objectFile: R2StorageObject;
  requestedPermission: ObjectPermission;
}): Promise<boolean> {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  // Objects without ACL metadata (e.g. migrated files) are treated as
  // accessible by default — they were stored before ACL was introduced.
  if (!aclPolicy) return true;

  if (
    aclPolicy.visibility === "public" &&
    requestedPermission === ObjectPermission.READ
  ) {
    return true;
  }

  if (!userId) return false;
  if (aclPolicy.owner === userId) return true;

  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (
      (await accessGroup.hasMember(userId)) &&
      isPermissionAllowed(requestedPermission, rule.permission)
    ) {
      return true;
    }
  }

  return false;
}
