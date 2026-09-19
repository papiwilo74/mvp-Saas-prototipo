import http from 'http';
import https from 'https';
import { URL } from 'url';

/**
 * High-performance load & stress testing tool for OrderFlow SaaS
 * Simulates real customer and kitchen traffic to measure concurrency, latency, and limits.
 */

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function parseArgs() {
  const args = process.argv.slice(2);
  let url = 'http://localhost:4000/api';
  let concurrency = 50;
  let totalRequests = 100;
  let restaurant = 'demo-burger';

  for (const arg of args) {
    if (arg.startsWith('--url=')) url = arg.slice(6);
    else if (arg.startsWith('--concurrency=')) concurrency = parseInt(arg.slice(14), 10);
    else if (arg.startsWith('--requests=')) totalRequests = parseInt(arg.slice(11), 10);
    else if (arg.startsWith('--restaurant=')) restaurant = arg.slice(13);
  }

  return { url, concurrency, totalRequests, restaurant };
}

function sendRequest(endpoint, method = 'GET', postData = null, clientIp = '190.25.10.1') {
  return new Promise((resolve) => {
    const parsed = new URL(endpoint);
    const transport = parsed.protocol === 'https:' ? https : http;
    const start = Date.now();

    const options = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OrderFlow-StressTester/1.0',
        'X-Forwarded-For': clientIp,
        ...(postData ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) } : {})
      },
      timeout: 10000
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          status: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 300,
          rateLimited: res.statusCode === 429
        });
      });
    });

    req.on('error', (err) => {
      const duration = Date.now() - start;
      resolve({ status: 0, duration, error: err.message, success: false, rateLimited: false });
    });

    req.on('timeout', () => {
      req.destroy();
      const duration = Date.now() - start;
      resolve({ status: 408, duration, error: 'TIMEOUT', success: false, rateLimited: false });
    });

    if (postData) req.write(postData);
    req.end();
  });
}

function calculatePercentiles(latencies) {
  if (latencies.length === 0) return { p50: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = Math.round(sum / sorted.length);

  const getP = (p) => sorted[Math.floor(sorted.length * (p / 100))];

  return {
    min,
    max,
    avg,
    p50: getP(50),
    p90: getP(90),
    p95: getP(95),
    p99: getP(99)
  };
}

async function runScenario(name, endpoint, concurrency, count, method = 'GET', body = null) {
  console.log(`\n${BOLD}${CYAN}» Ejecutando Escenario:${RESET} ${name}`);
  console.log(`  ${DIM}Objetivo: ${endpoint} | Concurrencia: ${concurrency} clientes simultáneos | Peticiones: ${count}${RESET}`);

  const results = [];
  const startAll = Date.now();
  let completed = 0;

  async function worker(workerId) {
    const simulatedIp = `190.25.${(workerId % 200) + 1}.${Math.floor(Math.random() * 250) + 1}`;
    while (completed < count) {
      completed++;
      const res = await sendRequest(endpoint, method, body, simulatedIp);
      results.push(res);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, count) }, (_, i) => worker(i));
  await Promise.all(workers);

  const totalTime = (Date.now() - startAll) / 1000;
  const successes = results.filter((r) => r.success).length;
  const rateLimits = results.filter((r) => r.rateLimited).length;
  const errors = results.filter((r) => !r.success && !r.rateLimited).length;
  const rps = (results.length / (totalTime || 0.001)).toFixed(1);

  const latencies = results.map((r) => r.duration);
  const stats = calculatePercentiles(latencies);

  console.log(`  ${GREEN}✓ Exitosas (2xx):${RESET} ${successes} (${Math.round((successes / results.length) * 100)}%)`);
  if (rateLimits > 0) {
    console.log(`  ${YELLOW}⚡ Rate Limited (429):${RESET} ${rateLimits} (Protección activa anti-DDoS)`);
  }
  if (errors > 0) {
    const sampleErr = results.find((r) => !r.success && !r.rateLimited);
    console.log(`  ${RED}✗ Fallidas (5xx/Err):${RESET} ${errors} (Ejemplo: Status ${sampleErr?.status || 0} - ${sampleErr?.error || 'Sin detalle'})`);
  }
  console.log(`  ${BOLD}Rendimiento:${RESET} ${rps} req/segundo en ${totalTime.toFixed(2)}s`);
  console.log(`  ${BOLD}Latencias:${RESET} Min: ${stats.min}ms | Promedio: ${stats.avg}ms | P50: ${stats.p50}ms | P95: ${stats.p95}ms | P99: ${stats.p99}ms | Max: ${stats.max}ms`);

  return { name, successes, rateLimits, errors, rps, stats, totalTime };
}

async function main() {
  const { url, concurrency, totalRequests, restaurant } = parseArgs();

  console.log(`\n${BOLD}====================================================${RESET}`);
  console.log(`${BOLD} 🔥 OrderFlow SaaS - Simulación de Carga y Estrés  ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}`);
  console.log(` Servidor:     ${url}`);
  console.log(` Restaurante:  ${restaurant}`);
  console.log(` Concurrencia: ${concurrency} usuarios simultáneos`);
  console.log(` Volumen:      ${totalRequests} peticiones por escenario`);

  // Escenario 1: Tráfico de Lectura Masiva (Clientes abriendo el Menú Digital QR)
  const menuScenario = await runScenario(
    '1. Clientes escaneando QR y cargando el Menú',
    `${url}/menu?restaurant=${restaurant}`,
    concurrency,
    totalRequests
  );

  // Escenario 2: Tráfico de Configuración (Estilos, Horarios, Zonas de Entrega)
  const configScenario = await runScenario(
    '2. Consulta de configuración de marca y entrega',
    `${url}/restaurant-config?restaurant=${restaurant}`,
    concurrency,
    totalRequests
  );

  // Escenario 3: Verificación de Estado de Salud del Backend
  const healthScenario = await runScenario(
    '3. Sondeo de salud del sistema (/health)',
    `${url}/health`,
    concurrency,
    Math.min(totalRequests, 50)
  );

  console.log(`\n${BOLD}====================================================${RESET}`);
  console.log(`${BOLD} 📊 Resumen Ejecutivo de la Prueba de Estrés        ${RESET}`);
  console.log(`${BOLD}====================================================${RESET}`);
  const allScenarios = [menuScenario, configScenario, healthScenario];
  const totalSuccess = allScenarios.reduce((acc, s) => acc + s.successes, 0);
  const totalRateLimits = allScenarios.reduce((acc, s) => acc + s.rateLimits, 0);
  const totalErrors = allScenarios.reduce((acc, s) => acc + s.errors, 0);

  console.log(` Peticiones procesadas: ${totalSuccess + totalRateLimits + totalErrors}`);
  console.log(` Tasa de éxito:         ${((totalSuccess / (totalSuccess + totalRateLimits + totalErrors || 1)) * 100).toFixed(1)}%`);
  console.log(` Respuestas 429 Shield: ${totalRateLimits} activaciones`);
  console.log(` Errores de servidor:   ${totalErrors === 0 ? `${GREEN}0 (Cero Caídas)${RESET}` : `${RED}${totalErrors}${RESET}`}`);
  console.log(`${BOLD}====================================================${RESET}\n`);
}

main().catch(console.error);
