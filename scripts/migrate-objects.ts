/**
 * scripts/migrate-objects.ts
 *
 * Script de un solo uso: copia TODOS los objetos del Object Storage de Replit
 * a Cloudflare R2, conservando exactamente la misma key/ruta.
 * No borra nada del origen.
 *
 * ORIGEN : @replit/object-storage (Client oficial — no necesita credenciales GCS)
 *          Bucket identificado por DEFAULT_OBJECT_STORAGE_BUCKET_ID
 *
 * DESTINO: Cloudflare R2 vía AWS SDK v3 (mismo cliente que server/r2Client.ts)
 *          Variables: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 *
 * Ejecución:
 *   npx tsx scripts/migrate-objects.ts
 */

import { Client as ReplitClient } from "@replit/object-storage";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

// ── Validación de variables de entorno ─────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`❌ Variable de entorno requerida no encontrada: ${name}`);
    process.exit(1);
  }
  return val;
}

const R2_BUCKET    = requireEnv("R2_BUCKET");
const R2_ENDPOINT  = requireEnv("R2_ENDPOINT");
const R2_ACCESS    = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET    = requireEnv("R2_SECRET_ACCESS_KEY");

// ── Clientes ───────────────────────────────────────────────────────────────

// ORIGEN: Replit Object Storage (sidecar local — no necesita credenciales externas)
const replitClient = new ReplitClient();

// DESTINO: Cloudflare R2 — idéntico a server/r2Client.ts
const r2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS,
    secretAccessKey: R2_SECRET,
  },
  forcePathStyle: true,
  // Cloudflare R2 rechaza los checksums automáticos del SDK v3 — desactivarlos
  requestChecksumCalculation: "WHEN_REQUIRED" as any,
  responseChecksumValidation: "WHEN_REQUIRED" as any,
});

// ── Opciones ───────────────────────────────────────────────────────────────

// true  → salta objetos que ya existen en R2 (permite reanudar sin duplicar)
// false → sobreescribe todo
const SKIP_EXISTING = true;

// Número de objetos procesados en paralelo
const CONCURRENCY = 5;

// ── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(2)} MB`;
}

async function existsInR2(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Migración: Replit Object Storage → Cloudflare R2");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Bucket destino : ${R2_BUCKET}`);
  console.log(`  SKIP_EXISTING  : ${SKIP_EXISTING}`);
  console.log(`  CONCURRENCY    : ${CONCURRENCY}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Listar todos los objetos del bucket de Replit
  console.log("⏳ Listando objetos en Replit Object Storage...");
  const listResult = await replitClient.list();

  if (!listResult.ok) {
    console.error("❌ Error al listar objetos:", listResult.error);
    process.exit(1);
  }

  const objects = listResult.value;
  console.log(`✅ ${objects.length} objeto(s) encontrado(s)\n`);

  if (objects.length === 0) {
    console.log("ℹ️  El bucket de origen está vacío. Nada que migrar.");
    return;
  }

  let copied  = 0;
  let skipped = 0;
  let failed  = 0;
  const errors: { key: string; error: string }[] = [];

  // 2. Procesar en lotes de CONCURRENCY
  for (let i = 0; i < objects.length; i += CONCURRENCY) {
    const batch = objects.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (obj) => {
        // La key en R2 es exactamente el nombre del objeto en Replit
        const key = obj.name;

        try {
          // Saltar si ya existe en R2
          if (SKIP_EXISTING && (await existsInR2(key))) {
            console.log(`  ⏭  OMITIDO (ya existe): ${key}`);
            skipped++;
            return;
          }

          // Descargar desde Replit Object Storage
          const downloadResult = await replitClient.downloadAsBytes(key);

          if (!downloadResult.ok) {
            const e = downloadResult.error as any;
            throw new Error(
              typeof e === "object" ? (e?.message ?? JSON.stringify(e)) : String(e)
            );
          }

          const [data] = downloadResult.value;

          // Subir a R2 con la misma key (sin anteponer el nombre del bucket)
          await r2.send(
            new PutObjectCommand({
              Bucket: R2_BUCKET,
              Key: key,           // ← solo uploads/<uuid>, sin prefijo del bucket
              Body: data,
              ContentLength: data.length,
            })
          );

          console.log(`  ✅ COPIADO  : ${key}  (${formatBytes(data.length)})`);
          copied++;
        } catch (err: any) {
          const msg: string = err?.message ?? String(err);
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
  console.log(`  Total en origen : ${objects.length}`);
  console.log(`  Copiados        : ${copied}`);
  console.log(`  Omitidos        : ${skipped}`);
  console.log(`  Fallidos        : ${failed}`);

  if (errors.length > 0) {
    console.log("\n  Detalle de errores:");
    for (const { key, error } of errors) {
      console.log(`    • ${key}: ${error}`);
    }
  }

  console.log("═══════════════════════════════════════════════════════");
  if (failed === 0) {
    console.log("  ✅ Migración completada sin errores.");
  } else {
    console.log(
      `  ⚠️  Migración completada con ${failed} error(es).` +
      `\n  Vuelve a ejecutar el script para reintentar los fallidos (SKIP_EXISTING=true omitirá los ya copiados).`
    );
  }
  console.log("═══════════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
