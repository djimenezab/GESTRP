/**
 * scripts/fix-content-types.ts
 *
 * Script de un solo uso: recorre los objetos de R2 bajo uploads/ (y la ruta
 * legacy gestrp-archivos/uploads/) cuyo ContentType sea application/octet-stream,
 * detecta el tipo real por magic bytes y lo corrige con CopyObject sobre sí mismo.
 *
 * No borra ni mueve nada — solo actualiza metadatos ContentType en R2.
 *
 * Ejecución:
 *   npx tsx scripts/fix-content-types.ts
 *   npx tsx scripts/fix-content-types.ts --dry-run   ← muestra qué haría sin cambiar nada
 */

import {
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

// ── Env vars ───────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) { console.error(`❌ Falta variable de entorno: ${name}`); process.exit(1); }
  return val;
}

const R2_BUCKET   = requireEnv("R2_BUCKET");
const R2_ENDPOINT = requireEnv("R2_ENDPOINT");
const R2_ACCESS   = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET   = requireEnv("R2_SECRET_ACCESS_KEY");

// ── Mismo normalizeEndpoint que r2Client.ts ────────────────────────────────

function normalizeEndpoint(endpoint: string, bucket: string): string {
  const suffix = `/${bucket}`;
  return endpoint.endsWith(suffix) ? endpoint.slice(0, -suffix.length) : endpoint;
}

const baseEndpoint = normalizeEndpoint(R2_ENDPOINT, R2_BUCKET);

const r2 = new S3Client({
  region: "auto",
  endpoint: baseEndpoint,
  credentials: { accessKeyId: R2_ACCESS, secretAccessKey: R2_SECRET },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED" as any,
  responseChecksumValidation: "WHEN_REQUIRED" as any,
});

// ── Magic bytes → MIME type ────────────────────────────────────────────────
//
// Se descargan los primeros 12 bytes del objeto para identificar el tipo real.
// Formatos cubiertos: PDF, PNG, JPEG, GIF, WebP, ZIP (incluye DOCX/XLSX/PPTX),
// GZIP, BMP, TIFF, MP4/ISO-BMFF, WebM/Matroska.

interface MimeMatch {
  mime: string;
  label: string;            // descripción legible para el log
}

function detectMime(buf: Buffer): MimeMatch {
  const b = buf;

  // PDF: %PDF
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46)
    return { mime: "application/pdf", label: "PDF" };

  // PNG: \x89PNG\r\n\x1a\n
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47)
    return { mime: "image/png", label: "PNG" };

  // JPEG: \xFF\xD8\xFF
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF)
    return { mime: "image/jpeg", label: "JPEG" };

  // GIF: GIF87a / GIF89a
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46)
    return { mime: "image/gif", label: "GIF" };

  // BMP: BM
  if (b[0] === 0x42 && b[1] === 0x4D)
    return { mime: "image/bmp", label: "BMP" };

  // TIFF (little-endian II* or big-endian MM*)
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2A && b[3] === 0x00) ||
      (b[0] === 0x4D && b[1] === 0x4D && b[2] === 0x00 && b[3] === 0x2A))
    return { mime: "image/tiff", label: "TIFF" };

  // WebP: RIFF????WEBP (12 bytes)
  if (buf.length >= 12 &&
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return { mime: "image/webp", label: "WebP" };

  // ZIP / Office Open XML (DOCX, XLSX, PPTX): PK\x03\x04
  if (b[0] === 0x50 && b[1] === 0x4B && b[2] === 0x03 && b[3] === 0x04)
    return { mime: "application/zip", label: "ZIP/Office OpenXML" };

  // GZIP: \x1F\x8B
  if (b[0] === 0x1F && b[1] === 0x8B)
    return { mime: "application/gzip", label: "GZIP" };

  // MP4 / ISO Base Media File Format: ????ftyp (bytes 4-7)
  if (buf.length >= 8 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70)
    return { mime: "video/mp4", label: "MP4/ISOBMFF" };

  // WebM / Matroska: \x1A\x45\xDF\xA3
  if (b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3)
    return { mime: "video/webm", label: "WebM" };

  return { mime: "application/octet-stream", label: "desconocido" };
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function streamToBuffer(stream: Readable, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    stream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      total += chunk.length;
      if (total >= maxBytes) stream.destroy();
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("close", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function getMagicBytes(key: string): Promise<Buffer> {
  const result = await r2.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Range: "bytes=0-11",   // 12 bytes — suficiente para todos los magic numbers
    })
  );
  return streamToBuffer(result.Body as Readable, 12);
}

async function listAllObjects(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const resp = await r2.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    for (const obj of resp.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (continuationToken);
  return keys;
}

// ── Main ───────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 4;

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Fix content-types: R2 application/octet-stream → tipo real");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Bucket    : ${R2_BUCKET}`);
  console.log(`  Endpoint  : ${baseEndpoint}  (normalizado)`);
  console.log(`  DRY RUN   : ${DRY_RUN}`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Listar claves en ambas rutas (canónica + legacy con prefijo bucket)
  console.log("⏳ Listando objetos en R2...");
  const [canonical, legacy] = await Promise.all([
    listAllObjects("uploads/"),
    listAllObjects(`${R2_BUCKET}/uploads/`),
  ]);
  const allKeys = [...new Set([...canonical, ...legacy])];
  console.log(`   uploads/                     : ${canonical.length} objetos`);
  console.log(`   ${R2_BUCKET}/uploads/ : ${legacy.length} objetos`);
  console.log(`   Total único                  : ${allKeys.length} objetos\n`);

  if (allKeys.length === 0) {
    console.log("ℹ️  No hay objetos bajo uploads/. Nada que hacer.");
    return;
  }

  // Filtrar los que tienen ContentType application/octet-stream
  console.log("⏳ Comprobando ContentType de cada objeto (Head)...");
  const toFix: string[] = [];
  const alreadyTyped: string[] = [];

  for (let i = 0; i < allKeys.length; i += CONCURRENCY) {
    const batch = allKeys.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (key) => {
      const head = await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
      const ct = head.ContentType ?? "application/octet-stream";
      if (ct === "application/octet-stream" || !ct || ct === "") {
        toFix.push(key);
      } else {
        alreadyTyped.push(key);
      }
    }));
  }

  console.log(`   Con tipo correcto     : ${alreadyTyped.length}`);
  console.log(`   Necesitan corrección  : ${toFix.length}\n`);

  if (toFix.length === 0) {
    console.log("✅ Todos los objetos ya tienen ContentType correcto. Nada que hacer.");
    return;
  }

  // Procesar los que necesitan corrección
  let fixed = 0;
  let unknown = 0;
  let failed = 0;
  const errors: { key: string; error: string }[] = [];
  const unknownKeys: string[] = [];

  console.log(`⏳ ${DRY_RUN ? "[DRY RUN] " : ""}Detectando y corrigiendo tipos...\n`);

  for (let i = 0; i < toFix.length; i += CONCURRENCY) {
    const batch = toFix.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (key) => {
      try {
        const magicBuf = await getMagicBytes(key);
        const { mime, label } = detectMime(magicBuf);

        if (mime === "application/octet-stream") {
          console.log(`  ❓ DESCONOCIDO  ${key}  (primeros bytes: ${magicBuf.toString("hex")})`);
          unknownKeys.push(key);
          unknown++;
          return;
        }

        if (DRY_RUN) {
          console.log(`  🔍 [dry-run]  ${key}  →  ${mime}  (${label})`);
          fixed++;
          return;
        }

        // CopyObject sobre sí mismo con nuevo ContentType
        await r2.send(new CopyObjectCommand({
          Bucket: R2_BUCKET,
          Key: key,
          CopySource: `${R2_BUCKET}/${key}`,
          MetadataDirective: "REPLACE",
          ContentType: mime,
        }));

        console.log(`  ✅ CORREGIDO   ${key}  →  ${mime}  (${label})`);
        fixed++;
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        console.error(`  ❌ FALLIDO     ${key}  |  ${msg}`);
        errors.push({ key, error: msg });
        failed++;
      }
    }));
  }

  // Resumen
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  RESUMEN FINAL");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Total con octet-stream : ${toFix.length}`);
  console.log(`  Corregidos             : ${fixed}`);
  console.log(`  Tipo no reconocido     : ${unknown}`);
  console.log(`  Fallidos               : ${failed}`);
  if (DRY_RUN) console.log("\n  (modo DRY RUN — no se ha modificado nada)");

  if (unknownKeys.length > 0) {
    console.log("\n  Objetos con tipo no reconocido (revisar manualmente):");
    for (const k of unknownKeys) console.log(`    • ${k}`);
  }
  if (errors.length > 0) {
    console.log("\n  Errores:");
    for (const { key, error } of errors) console.log(`    • ${key}: ${error}`);
  }

  console.log("═══════════════════════════════════════════════════════════════\n");
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
