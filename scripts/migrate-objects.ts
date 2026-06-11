/**
 * scripts/migrate-objects.ts
 *
 * Script de un solo uso: copia TODOS los objetos del Object Storage de Replit
 * a Cloudflare R2. No borra nada del origen.
 *
 * ORIGEN : @replit/object-storage (Client oficial — sin credenciales GCS)
 * DESTINO: Cloudflare R2 vía AWS SDK v3
 *
 * Transformación de keys:
 *   Replit : .private/uploads/<uuid>   (prefijo .private/ gestionado internamente)
 *   R2     : uploads/<uuid>            (raíz del bucket, sin prefijo)
 *
 * Ejecución:
 *   npx tsx scripts/migrate-objects.ts
 */

import { Client as ReplitClient } from "@replit/object-storage";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

// ── Validación de env vars ─────────────────────────────────────────────────

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    console.error(`❌ Variable de entorno requerida no encontrada: ${name}`);
    process.exit(1);
  }
  return val;
}

const R2_BUCKET   = requireEnv("R2_BUCKET");
const R2_ENDPOINT = requireEnv("R2_ENDPOINT");
const R2_ACCESS   = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET   = requireEnv("R2_SECRET_ACCESS_KEY");

// ── Normalización del endpoint ─────────────────────────────────────────────
//
// R2_ENDPOINT puede estar configurado con el nombre del bucket ya incluido como
// segmento de ruta, p.ej.:
//   https://<account>.r2.cloudflarestorage.com/gestrp-archivos
//
// Con forcePathStyle: true el SDK añade /<bucket>/<key> al final del endpoint,
// lo que resultaría en:
//   https://<account>.r2.cloudflarestorage.com/gestrp-archivos/gestrp-archivos/uploads/<uuid>
//
// Solución: eliminar el sufijo /<bucket> del endpoint si ya está presente.

function normalizeEndpoint(endpoint: string, bucket: string): string {
  const suffix = `/${bucket}`;
  return endpoint.endsWith(suffix) ? endpoint.slice(0, -suffix.length) : endpoint;
}

const baseEndpoint = normalizeEndpoint(R2_ENDPOINT, R2_BUCKET);

// ── Transformación de keys ─────────────────────────────────────────────────
//
// En Replit Object Storage los archivos privados se guardan bajo el prefijo
// .private/ (gestionado por la integración). La app los busca en R2 sin ese
// prefijo, directamente como uploads/<uuid>.

function toR2Key(replitName: string): string {
  return replitName.replace(/^\.private\//, "");
}

// ── Clientes ───────────────────────────────────────────────────────────────

const replitClient = new ReplitClient();

const r2 = new S3Client({
  region: "auto",
  endpoint: baseEndpoint,           // endpoint limpio, sin el bucket en la ruta
  credentials: {
    accessKeyId: R2_ACCESS,
    secretAccessKey: R2_SECRET,
  },
  forcePathStyle: true,             // SDK construye: <baseEndpoint>/<bucket>/<key> ✅
  requestChecksumCalculation: "WHEN_REQUIRED" as any,
  responseChecksumValidation: "WHEN_REQUIRED" as any,
});

// ── Opciones ───────────────────────────────────────────────────────────────

// true  → salta objetos que ya existen en R2 (permite reanudar sin duplicar)
const SKIP_EXISTING = true;

// Objetos procesados en paralelo
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
  console.log(`  Endpoint R2    : ${baseEndpoint}  (normalizado)`);
  console.log(`  Bucket destino : ${R2_BUCKET}`);
  console.log(`  SKIP_EXISTING  : ${SKIP_EXISTING}`);
  console.log(`  CONCURRENCY    : ${CONCURRENCY}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Listar objetos en Replit Object Storage
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

  // 2. Preview de las primeras 3 keys para verificar el mapeo antes de copiar
  console.log("─── Vista previa del mapeo de keys (primeras 3) ───────");
  const preview = objects.slice(0, 3);
  for (const obj of preview) {
    console.log(`  ORIGEN  : ${obj.name}`);
    console.log(`  DESTINO : uploads/${toR2Key(obj.name).split("/").slice(1).join("/") || toR2Key(obj.name)}`);
    console.log(`            → key exacta: "${toR2Key(obj.name)}"`);
    console.log();
  }
  console.log("───────────────────────────────────────────────────────\n");

  let copied  = 0;
  let skipped = 0;
  let failed  = 0;
  const errors: { srcKey: string; destKey: string; error: string }[] = [];

  // 3. Copiar en lotes
  for (let i = 0; i < objects.length; i += CONCURRENCY) {
    const batch = objects.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (obj) => {
        const srcKey  = obj.name;
        const destKey = toR2Key(srcKey);   // elimina .private/ si existe

        try {
          // Saltar si ya existe en R2
          if (SKIP_EXISTING && (await existsInR2(destKey))) {
            console.log(`  ⏭  OMITIDO   ${srcKey}  →  ${destKey}`);
            skipped++;
            return;
          }

          // Descargar desde Replit
          const dlResult = await replitClient.downloadAsBytes(srcKey);
          if (!dlResult.ok) {
            const e = dlResult.error as any;
            throw new Error(
              typeof e === "object" ? (e?.message ?? JSON.stringify(e)) : String(e)
            );
          }
          const [data] = dlResult.value;

          // Subir a R2 — key sin prefijo de bucket ni .private/
          await r2.send(
            new PutObjectCommand({
              Bucket: R2_BUCKET,
              Key: destKey,
              Body: data,
              ContentLength: data.length,
            })
          );

          console.log(`  ✅ COPIADO   ${srcKey}  →  ${destKey}  (${formatBytes(data.length)})`);
          copied++;
        } catch (err: any) {
          const msg: string = err?.message ?? String(err);
          console.error(`  ❌ FALLIDO   ${srcKey}  →  ${destKey}  |  ${msg}`);
          errors.push({ srcKey, destKey, error: msg });
          failed++;
        }
      })
    );
  }

  // 4. Resumen final
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  RESUMEN FINAL");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Total en origen : ${objects.length}`);
  console.log(`  Copiados        : ${copied}`);
  console.log(`  Omitidos        : ${skipped}`);
  console.log(`  Fallidos        : ${failed}`);

  if (errors.length > 0) {
    console.log("\n  Detalle de errores:");
    for (const { srcKey, destKey, error } of errors) {
      console.log(`    • ${srcKey}  →  ${destKey}`);
      console.log(`      ${error}`);
    }
  }

  console.log("═══════════════════════════════════════════════════════");
  if (failed === 0) {
    console.log("  ✅ Migración completada sin errores.");
  } else {
    console.log(
      `  ⚠️  Migración completada con ${failed} error(es).\n` +
      `  Vuelve a ejecutar el script: los ya copiados se omitirán (SKIP_EXISTING=true).`
    );
  }
  console.log("═══════════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Error fatal:", err);
  process.exit(1);
});
