/**
 * supabase/schema.sql dosyasını veritabanında çalıştırır.
 * Kullanım:  SUPABASE_DB_URL="postgresql://..." node scripts/run-schema.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "..", "supabase", "schema.sql");

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("HATA: SUPABASE_DB_URL ortam değişkeni gerekli.");
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Bağlandı, şema çalıştırılıyor…");
  await client.query(sql);
  console.log("✓ Şema başarıyla uygulandı.");

  const { rows } = await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public'
     order by table_name`
  );
  console.log("Public tablolar:", rows.map((r) => r.table_name).join(", "));
} catch (err) {
  console.error("✗ Hata:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
