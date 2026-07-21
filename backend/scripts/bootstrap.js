import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');
const envExamplePath = resolve(root, '.env.example');

const run = (cmd, label) => {
  console.log(`\n[${label}] Running: ${cmd}`);
  try {
    execSync(cmd, { cwd: root, stdio: 'inherit' });
    console.log(`[${label}] Done.`);
  } catch (err) {
    console.error(`[${label}] Failed: ${err.message}`);
    process.exit(1);
  }
};

function checkEnv() {
  if (!existsSync(envPath)) {
    if (!existsSync(envExamplePath)) {
      console.error('No .env.example found. Cannot bootstrap.');
      process.exit(1);
    }
    console.log('.env not found. Copying from .env.example...');
    copyFileSync(envExamplePath, envPath);
    console.log('.env created. Review it before continuing.\n');
    return false;
  }
  return true;
}

function validateEnv() {
  console.log('\n[env:validate] Validating environment variables...');
  try {
    execSync('node -e "require(\'./src/config/env.js\')"', { cwd: root, stdio: 'inherit' });
    console.log('[env:validate] All required variables are set and valid.\n');
  } catch (err) {
    console.error('[env:validate] Validation failed. Check your .env file.');
    process.exit(1);
  }
}

function main() {
  console.log('=== FastFood SaaS Bootstrap ===\n');
  console.log(`Working directory: ${root}`);

  const hadEnv = checkEnv();

  run('npm install', 'npm install');

  if (!hadEnv) {
    console.log('\n⚠  .env was just created from the template.');
    console.log('   Please review it and re-run bootstrap when ready.\n');
    process.exit(0);
  }

  validateEnv();

  run('npx prisma generate', 'prisma generate');

  const shouldMigrate = process.argv.includes('--migrate');
  const shouldSeed = process.argv.includes('--seed');
  const shouldVerify = process.argv.includes('--verify');

  if (shouldMigrate) {
    run('npx prisma migrate dev', 'prisma migrate dev');
  }

  if (shouldSeed) {
    run('npx prisma db seed', 'prisma db seed');
  }

  if (!shouldMigrate && !shouldSeed) {
    console.log('\nTip: run with --migrate --seed to also set up the database.');
  }

  console.log('\n=== Bootstrap complete ===');

  if (shouldVerify) {
    console.log('\n=== Running deploy verification ===');
    try {
      execSync('node scripts/deploy-verify.js --url=http://localhost:4000/api', {
        cwd: root,
        stdio: 'inherit'
      });
    } catch (err) {
      console.error('\n⚠  Deploy verification failed. Check that the server is running on http://localhost:4000 and try again.\n');
      process.exit(1);
    }
  }
}

main();
