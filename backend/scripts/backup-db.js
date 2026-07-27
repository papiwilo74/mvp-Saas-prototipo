/**
 * Script de backup de la base de datos PostgreSQL.
 *
 * Uso:
 *   node scripts/backup-db.js                     # backup con nombre automatico
 *   node scripts/backup-db.js --output=backup.sql  # backup con nombre personalizado
 *
 * Requisitos:
 *   - pg_dump instalado en el sistema
 *   - DATABASE_URL configurada en .env
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backupsDir = join(__dirname, '..', 'backups');

const args = process.argv.slice(2);
const outputArg = args.find((a) => a.startsWith('--output='));
const customOutput = outputArg ? outputArg.split('=')[1] : null;

if (!existsSync(backupsDir)) {
  mkdirSync(backupsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
const outputFile = customOutput || join(backupsDir, `backup_${timestamp}.sql`);

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL no configurada en el entorno');
  process.exit(1);
}

try {
  console.log(`Realizando backup de la base de datos...`);
  execSync(`pg_dump "${dbUrl}" --no-owner --no-acl -f "${outputFile}"`, {
    stdio: 'inherit',
    env: { ...process.env, PGPASSWORD: '' }
  });
  console.log(` Backup completado: ${outputFile}`);
  console.log(` Tamano: ${(existsSync(outputFile) ? require('fs').statSync(outputFile).size / 1024 / 1024 : 0).toFixed(2)} MB`);
} catch (error) {
  console.error(' Error al realizar el backup:', error.message);
  process.exit(1);
}
