import { execSync } from 'child_process';
import { existsSync, mkdirSync, unlinkSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = join(__dirname, '..', 'backups');
const RETENTION_DAYS = 14;

function parseDatabaseUrl(url) {
  const pattern = /^postgres(ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)\?/;
  const match = url.match(pattern);
  if (!match) {
    const simple = /^postgres(ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const m2 = url.match(simple);
    if (!m2) throw new Error('No se pudo parsear DATABASE_URL');
    return { user: m2[2], password: m2[3], host: m2[4], port: m2[5], database: m2[6] };
  }
  return { user: match[2], password: match[3], host: match[4], port: match[5], database: match[6] };
}

async function runBackup() {
  if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL no definida');
    process.exit(1);
  }

  const db = parseDatabaseUrl(databaseUrl);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${db.database}-${timestamp}.sql`;
  const filepath = join(BACKUP_DIR, filename);

  console.log(`Iniciando backup de ${db.database}...`);

  const env = { ...process.env };
  env.PGPASSWORD = db.password;

  execSync(
    `pg_dump --host=${db.host} --port=${db.port} --username=${db.user} --no-password --format=custom --file="${filepath}" ${db.database}`,
    { env, stdio: 'pipe' }
  );

  console.log(`Backup creado: ${filepath}`);

  const stats = execSync(`ls -lh "${filepath}"`, { encoding: 'utf8' });
  console.log(`Tamaño: ${stats.trim().split(/\s+/)[4]}`);

  cleanupOldBackups();

  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    const message = `Backup completado: ${filename}`;
    execSync(`curl -X POST -H 'Content-Type: application/json' -d '{"text":"${message}"}' "${webhook}"`, { stdio: 'ignore' });
  }
}

function cleanupOldBackups() {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  if (!existsSync(BACKUP_DIR)) return;

  for (const file of readdirSync(BACKUP_DIR)) {
    if (!file.startsWith('backup-')) continue;
    const filepath = join(BACKUP_DIR, file);
    const stat = existsSync(filepath) ? execSync(`stat -c %Y "${filepath}"`, { encoding: 'utf8' }).trim() : null;
    if (stat && Number(stat) * 1000 < cutoff) {
      unlinkSync(filepath);
      console.log(`Backup antiguo eliminado: ${file}`);
    }
  }
}

runBackup().catch((err) => {
  console.error('Error en backup:', err.message);
  process.exit(1);
});
