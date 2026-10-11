import { get } from 'http';
import { get as getHttps } from 'https';
import { URL } from 'url';

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const DEFAULT_TARGETS = [
  'https://mvp-saas-prototipo.onrender.com/api/health',
  'https://orderflowapp.online/api/health'
];

function httpGet(urlStr, timeoutMs = 35000) {
  const parsed = new URL(urlStr);
  const transport = parsed.protocol === 'https:' ? getHttps : get;
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const req = transport(urlStr, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const latencyMs = Date.now() - start;
        let body = null;
        try {
          body = JSON.parse(data);
        } catch {
          body = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          latencyMs
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout tras ${timeoutMs}ms (posible arranque en frío de Render/Neon)`));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function pingWithRetry(url, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const timestamp = new Date().toISOString();
    try {
      const res = await httpGet(url);
      const isOk = res.statusCode >= 200 && res.statusCode < 300;
      const dbStatus = res.body && typeof res.body === 'object' ? (res.body.db || 'connected') : 'n/a';

      if (isOk) {
        console.log(
          `[${timestamp}] ${GREEN}${BOLD}✓ ALIVE${RESET} [${res.statusCode}] ${CYAN}${url}${RESET} ` +
          `| Latencia: ${BOLD}${res.latencyMs}ms${RESET} | DB: ${dbStatus === 'connected' ? GREEN + 'conectada' : YELLOW + dbStatus}${RESET}`
        );
        return { success: true, url, latencyMs: res.latencyMs, db: dbStatus };
      } else {
        console.warn(
          `[${timestamp}] ${YELLOW}⚠ STATUS ${res.statusCode}${RESET} en ${url} | Intento ${attempt}/${maxRetries}`
        );
      }
    } catch (err) {
      console.warn(
        `[${timestamp}] ${YELLOW}⚠ Intento ${attempt}/${maxRetries} falló para ${url}: ${err.message}${RESET}`
      );
      if (attempt < maxRetries) {
        console.log(`[${timestamp}] ${DIM}Esperando 5s para reintentar (permitiendo calentamiento de instancia)...${RESET}`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  console.error(`[${new Date().toISOString()}] ${RED}${BOLD}✗ FALLO DEFINITIVO${RESET} para ${url}`);
  return { success: false, url };
}

async function run() {
  const args = process.argv.slice(2);
  const isLoop = args.includes('--loop');
  const customUrlArg = args.find((a) => a.startsWith('--url='));
  const intervalArg = args.find((a) => a.startsWith('--interval='));

  const intervalSeconds = intervalArg ? parseInt(intervalArg.slice('--interval='.length), 10) : 600;
  const targets = customUrlArg ? [customUrlArg.slice('--url='.length)] : DEFAULT_TARGETS;

  console.log(`${BOLD}======================================================${RESET}`);
  console.log(`${BOLD}OrderFlow Anti-Sleep & Cold-Start Keep-Alive Engine${RESET}`);
  console.log(`Objetivos: ${targets.join(', ')}`);
  console.log(`Modo: ${isLoop ? `Bucle continuo (cada ${intervalSeconds}s)` : 'Una sola ejecución (cron/CI)'}`);
  console.log(`${BOLD}======================================================${RESET}`);

  const executeOnce = async () => {
    let allOk = true;
    for (const target of targets) {
      const result = await pingWithRetry(target);
      if (!result.success) allOk = false;
    }
    return allOk;
  };

  if (!isLoop) {
    const success = await executeOnce();
    process.exit(success ? 0 : 1);
  } else {
    await executeOnce();
    setInterval(async () => {
      await executeOnce();
    }, intervalSeconds * 1000);
  }
}

run();
