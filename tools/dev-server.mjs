import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const PORT = Number(process.env.PORT) || 5678;
const STYLE_FILE = path.join(repoRoot, 'bahn-expert-redesign.user.css');
const INJECT_FILE = path.join(__dirname, 'inject.js');
const CERT_DIR = path.join(__dirname, '.certs');
const KEY_FILE = path.join(CERT_DIR, 'key.pem');
const CERT_FILE = path.join(CERT_DIR, 'cert.pem');

const routes = {
  '/style.css': { file: STYLE_FILE, type: 'text/css; charset=utf-8' },
  '/inject.js': { file: INJECT_FILE, type: 'application/javascript; charset=utf-8' },
};

async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function ensureCert() {
  if (await fileExists(KEY_FILE) && await fileExists(CERT_FILE)) {
    return { key: await readFile(KEY_FILE), cert: await readFile(CERT_FILE) };
  }
  const { default: selfsigned } = await import('selfsigned');
  const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
    days: 3650,
    keySize: 2048,
  });
  await mkdir(CERT_DIR, { recursive: true });
  await writeFile(KEY_FILE, pems.private);
  await writeFile(CERT_FILE, pems.cert);
  return { key: pems.private, cert: pems.cert };
}

async function handler(req, res) {
  const route = routes[req.url];

  if (!route) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found. Verfügbar: /style.css, /inject.js');
    return;
  }

  try {
    const body = await readFile(route.file, 'utf8');
    res.writeHead(200, {
      'Content-Type': route.type,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Fehler beim Lesen von ${route.file}: ${err.message}`);
  }
}

async function start() {
  let server;
  let scheme;
  try {
    const { key, cert } = await ensureCert();
    server = createHttpsServer({ key, cert }, handler);
    scheme = 'https';
  } catch (err) {
    console.warn('Konnte kein lokales HTTPS-Zertifikat erzeugen (npm install ausgeführt?):', err.message);
    console.warn('Fallback auf HTTP – fetch() von bahn.expert (https) wird dann als Mixed Content blockiert.');
    console.warn('Alternative: CSS manuell aus /style.css kopieren und in der Konsole einfügen.');
    server = createHttpServer(handler);
    scheme = 'http';
  }

  server.listen(PORT, () => {
    console.log(`Preview-Server läuft: ${scheme}://localhost:${PORT}`);
    console.log(`  CSS:    ${scheme}://localhost:${PORT}/style.css`);
    console.log(`  Inject: ${scheme}://localhost:${PORT}/inject.js`);
    if (scheme === 'https') {
      console.log('');
      console.log('Einmalig nötig: https://localhost:%d/style.css im Browser öffnen', PORT);
      console.log('und die Sicherheitswarnung (selbstsigniertes Zertifikat) bestätigen.');
      console.log('Danach auf bahn.expert in der Konsole ausführen:');
      console.log(`  fetch("${scheme}://localhost:${PORT}/inject.js").then(r=>r.text()).then(eval)`);
    }
  });
}

start();
