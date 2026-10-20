// A tiny static server for the demos (modules and importmap don't work over file://).
// node tests/serve.mjs [port] → http://localhost:port/demo/kit.html
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('skills/night-glass'), port = +process.argv[2] || 4321;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.md': 'text/plain; charset=utf-8' };

http.createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  const file = join(root, path || 'demo/kit.html');
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }   // don't serve anything outside the skill folder
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found'); }
}).listen(port, () => console.log(`Night Glass: http://localhost:${port}/demo/kit.html`));
