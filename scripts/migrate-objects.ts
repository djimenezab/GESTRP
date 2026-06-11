/**
 * scripts/migrate-objects.ts
 *
 * Script de un solo uso: copia TODOS los objetos del bucket de Replit
 * Object Storage (Google Cloud Storage) a Cloudflare R2, conservando
 * exactamente la misma key/ruta. No borra nada del origen.
 *
 * Requisitos de entorno:
 *   ORIGEN  – credenciales GCS vía ADC (provistas por la integración de
 *             Replit Object Storage); bucket en DEFAULT_OBJECT_STORAGE_BUCKET_ID
 *   DESTINO – R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 *
 * Ejecución:
 *   npx tsx scripts/migrate-objects.ts
 */

import { Storage } from "@google-cloud/storage";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

// ── Configuración ──────────────────────────────────────────────────────────

const GCS_BUCKET = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;

// Poner a true para saltar objetos que ya existen en R2 (reanudar migración)
const SKIP_EXISTING = true;

// Número de objetos que se procesan en paralelo (ajustar según RAM/red)
const CONCURRENCY = 5;

// ── Validación ─────────────────────────────────────────────────────────────

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    console.error(`❌ Variable de entorno requerida no encontrada: ${name}`);
    process.exit(1);
  }
  return value;
}

assertEnv("DEFAULT_OBJECT_STORAGE_BUCKET_ID", GCS_BUCKET);
assertEnv("R2_ENDPOINT", R2_ENDPOINT);
assertEnv("R2_ACCESS_KEY_ID", R2_ACCESS_KEY_ID);
assertEnv("R2_SECRET_ACCESS_KEY", R2_SECRET_ACCESS_KEY);
assertEnv("R2_BUCKET", R2_BUCKET);

// ── Clientes ───────────────────────────────────────────────────────────────

const gcs = new Storage();
const gcsBucket = gcs.bucket(GCS_BUCKET!);

const r2 = new S3Client({
  endpoint: R2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED" as any,
  responseChecksumValidation: "WHEN_REQUIRED" as any,
});

// ── Helpers ────────────────────────────────────────────────────────────────

async function existsInR2(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ── Función principal ──────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Migración: Replit Object Storage → Cloudflare R2");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Origen  : gs://${GCS_BUCKET}`);
  console.log(`  Destino : ${R2_ENDPOINT}/${R2_BUCKET}`);
  console.log(`  SKIP_EXISTING: ${SKIP_EXISTING}`);
  console.log(`  CONCURRENCY : ${CONCURRENCY}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Listar todos los objetos del bucket GCS
  console.log("⏳ Listando objetos en GCS...");
  const [files] = await gcsBucket.getFiles();
  console.log(`✅ ${files.length} objeto(s) encontrado(s) en GCS\n`);

  if (files.length === 0) {
    console.log("ℹ️  El bucket de origen está vacío. Nada que migrar.");
    return;
  }

  let copied = 0;
  let skipped = 0;
  let failed = 0;
  const errors: { key: string; error: string }[] = [];

  // 2. Procesar en lotes de CONCURRENCY
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (file) => {
        const key = file.name; // mismo path en R2

        try {
          // Saltar si ya existe en R2
          if (SKIP_EXISTING) {
            const exists = await existsInR2(key);
            if (exists) {
              console.log(`  ⏭  OMITIDO (ya existe): ${key}`);
              skipped++;
              return;
            }
          }

          // Descargar desde GCS
          const [metadata] = await file.getMetadata();
          const contentType =
            (metadata.contentType as string | undefined) ||
            "application/octet-stream";

          const readStream = file.createReadStream();
          const data = await streamToBuffer(readStream);

          // Subir a R2
          await r2.send(
            new PutObjectCommand({
              Bucket: R2_BUCKET,
              Key: key,
              Body: data,
              ContentType: contentType,
              ContentLength: data.length,
            })
          );

          console.log(
            `  ✅ COPIADO  : ${key}  (${formatBytes(data.length)}, ${contentType})`
          );
          copied++;
        } catch (err: any) {
          const msg = err?.message ?? String(err);
          console.error(`  ❌ FALLIDO  : ${key}  → ${msg}`);
          errors.push({ key, error: msg });
          failed++;
        }
      })
    );
  }

  // 3. Resumen final
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  RESUMEN FINAL");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Total en origen : ${files.length}`);
  console.log(`  Copiados        : ${copied}`);
  console.log(`  Omitidos        : ${skipped}`);
  console.log(`  Fallidos        : ${failed}`);

  if (errors.length > 0) {
    console.log("\n  Errores:");
    errors.forEach(({ key, error }) => {
      console.log(`    • ${key}: ${error}`);
    });
  }

  console.log("═══════════════════════════════════════════════════════");
  console.log(
    failed === 0
      ? "  ✅ Migración completada sin errores."
      : `  ⚠️  Migración completada con ${failed} error(es). Vuelve a ejecutar el script para reintentar (SKIP_EXISTING=true).`
  );
  console.log("═══════════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
