import { startServer } from './server.js';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const cfgPath = path.join(__dirname, 'config', 'config.json');
const config = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

startServer(config)
  .then(({ host, port }) => {
    console.log(`[agent] listening on ${host}:${port}`);
  })
  .catch((err) => {
    console.error('[agent] failed to start', err);
    process.exit(1);
  });
