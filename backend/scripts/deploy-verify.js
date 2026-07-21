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

const CHECK = '✓';
const CROSS = '✗';

let failures = 0;
let verbose = false;

function parseArgs(args) {
  let url = 'http://localhost:4000/api';
  let restaurant = 'demo-burger';
  let timeout = 10000;

  for (const arg of args) {
    if (arg === '--verbose') {
      verbose = true;
    } else if (arg.startsWith('--url=')) {
      url = arg.slice('--url='.length);
    } else if (arg.startsWith('--restaurant=')) {
      restaurant = arg.slice('--restaurant='.length);
    } else if (arg.startsWith('--timeout=')) {
      timeout = parseInt(arg.slice('--timeout='.length), 10);
    }
  }

  return { url, restaurant, timeout };
}

function httpGet(urlStr, opts = {}) {
  const parsed = new URL(urlStr);
  const transport = parsed.protocol === 'https:' ? getHttps : get;
  const start = Date.now();

  if (verbose) {
    console.log(`${DIM}  --> GET ${urlStr}${RESET}`);
  }

  return new Promise((resolve, reject) => {
    const req = transport(urlStr, { timeout: opts.timeout || 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const elapsed = Date.now() - start;
        let body;
        try {
          body = JSON.parse(data);
        } catch {
          body = data;
        }
        if (verbose) {
          console.log(`${DIM}  <-- ${res.statusCode} ${elapsed}ms body=${typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body).substring(0, 200)}${RESET}`);
        }
        resolve({ status: res.statusCode, body, elapsed });
      });
    });

    req.on('error', (err) => {
      const elapsed = Date.now() - start;
      let msg = err.message || err.code || 'connection failed';
      if (err.code && err.message) {
        msg = `${err.code}: ${err.message}`;
      }
      if (verbose) {
        console.log(`${DIM}  <-- ERROR ${elapsed}ms ${msg}${RESET}`);
      }
      reject({ message: msg, elapsed });
    });

    req.on('timeout', () => {
      req.destroy();
      const elapsed = Date.now() - start;
      reject({ message: `Timeout after ${opts.timeout || 10000}ms`, elapsed });
    });
  });
}

function padEnd(str, len) {
  while (str.length < len) str += ' ';
  return str;
}

function fail(name, status, elapsed, detail) {
  failures++;
  const label = padEnd(name, 18);
  const statusStr = status ? `${status}` : 'ERR';
  const timeStr = elapsed != null ? `${elapsed}ms` : '--';
  const detailStr = detail ? `  ${detail}` : '';
  console.log(`  ${RED}${CROSS}${RESET} ${label} ${RED}${statusStr}${RESET}  ${DIM}${timeStr}${RESET}${RED}${detailStr}${RESET}`);
}

function pass(name, status, elapsed) {
  const label = padEnd(name, 18);
  console.log(`  ${GREEN}${CHECK}${RESET} ${label} ${GREEN}${status}${RESET}  ${DIM}${elapsed}ms${RESET}`);
}

async function checkHealth(baseUrl, timeout) {
  const name = 'health';
  try {
    const { status, body, elapsed } = await httpGet(`${baseUrl}/health`, { timeout });
    if (status !== 200) {
      fail(name, status, elapsed, `expected 200`);
      return;
    }
    if (body.database !== 'ok') {
      fail(name, status, elapsed, `database=${body.database} expected "ok"`);
      return;
    }
    pass(name, status, elapsed);
  } catch (err) {
    fail(name, null, err.elapsed, err.message);
  }
}

async function checkMenu(baseUrl, restaurant, timeout) {
  const name = 'menu';
  try {
    const { status, body, elapsed } = await httpGet(`${baseUrl}/menu?restaurant=${encodeURIComponent(restaurant)}`, { timeout });
    if (status !== 200) {
      fail(name, status, elapsed, `expected 200`);
      return;
    }
    if (!body || (!body.restaurant && !body.categories)) {
      fail(name, status, elapsed, `response missing restaurant/categories`);
      return;
    }
    pass(name, status, elapsed);
  } catch (err) {
    fail(name, null, err.elapsed, err.message);
  }
}

async function checkConfig(baseUrl, restaurant, timeout) {
  const name = 'config';
  try {
    const { status, body, elapsed } = await httpGet(`${baseUrl}/restaurant-config?restaurant=${encodeURIComponent(restaurant)}`, { timeout });
    if (status !== 200) {
      fail(name, status, elapsed, `expected 200`);
      return;
    }
    pass(name, status, elapsed);
  } catch (err) {
    fail(name, null, err.elapsed, err.message);
  }
}

async function checkAuthRequired(baseUrl, timeout) {
  const name = 'auth required';
  try {
    const { status, body, elapsed } = await httpGet(`${baseUrl}/auth/me`, { timeout });
    if (status === 500) {
      fail(name, status, elapsed, `got 500, server may be crashing`);
      return;
    }
    if (status !== 401) {
      fail(name, status, elapsed, `expected 401, got ${status}`);
      return;
    }
    pass(name, status, elapsed);
  } catch (err) {
    fail(name, null, err.elapsed, err.message);
  }
}

async function main() {
  const { url, restaurant, timeout } = parseArgs(process.argv.slice(2));

  console.log(`\n${BOLD}Deploy Verification${RESET}`);
  console.log(`${DIM}  URL:   ${CYAN}${url}${RESET}`);
  console.log(`${DIM}  Restaurant: ${CYAN}${restaurant}${RESET}`);
  console.log(`${DIM}  Timeout:    ${CYAN}${timeout}ms${RESET}\n`);

  await checkHealth(url, timeout);
  await checkMenu(url, restaurant, timeout);
  await checkConfig(url, restaurant, timeout);
  await checkAuthRequired(url, timeout);

  console.log('');
  if (failures === 0) {
    console.log(`${GREEN}${BOLD}All checks passed ${CHECK}${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}${failures} check${failures > 1 ? 's' : ''} failed ${CROSS}${RESET}\n`);
    process.exit(1);
  }
}

main();
