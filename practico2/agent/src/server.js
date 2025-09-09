// Servidor TCP del agente: autentica con token, valida IPs, parsea NDJSON
// y despacha comandos (help, getosinfo, watch, getwatches, ps, oscmd, quit).
// Inicia servicios (Sampler y WatchManager con JsonStore) y responde con ok/err.
import net from 'net';
import path from 'path';
import { tryParseLine, ok, err } from './protocol.js';
import { loadTokens, isValidToken } from './services/tokenStore.js';
import { Sampler } from './services/sampler.js';
import { WatchManager } from './services/watchManager.js';
import { ipAllowed } from './services/security.js';
import { JsonStore } from './services/jsonStore.js';      
import url from 'url';

import getosinfoFactory from './commands/getosinfo.js';
import helpFactory from './commands/help.js';
import watchFactory from './commands/watch.js';
import getwatchesFactory from './commands/getwatches.js';
import psFactory from './commands/ps.js';
import oscmdFactory from './commands/oscmd.js';
import quitFactory from './commands/quit.js';

export async function startServer(config) {
  loadTokens();

  const sampler = new Sampler(config.limits.sampler);
  sampler.start();

  // resolver ruta absoluta del dbDir con base en este archivo
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const dbDir = path.resolve(__dirname, config.storage?.dbDir || './data');
  const store = new JsonStore(dbDir);                            

  const watchManager = new WatchManager(config.limits.watch, store);

  const commands = {
    help:      helpFactory(),	  
    getosinfo: getosinfoFactory(sampler),
    watch:     watchFactory(watchManager),
    getwatches:getwatchesFactory(watchManager),
    ps:        psFactory(),
    oscmd:     oscmdFactory({ whitelist: config.security.oscmdWhitelist }),
    quit:      quitFactory()
  };

  const server = net.createServer((socket) => {
    const remoteIp = socket.remoteAddress;
    let authed = !config.auth.required;
    let buffer = '';

    if (!ipAllowed(remoteIp, config.security.remoteIpWhitelist)) {
      socket.write(err(null, 'forbidden', 'remote IP not allowed'));
      return socket.end();
    }

    socket.on('data', async (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const msg = tryParseLine(line);
        if (!msg) continue;

        if (msg._parseError) {
          socket.write(err(null, 'bad_request', 'invalid JSON'));
          continue;
        }

        const { id, type, token, cmd, args } = msg;

        if (!authed) {
          if (type !== 'auth') {
            socket.write(err(id, 'unauthorized', 'auth required'));
            continue;
          }
          if (!token || !isValidToken(token)) {
            socket.write(err(id, 'unauthorized', 'invalid token'));
            continue;
          }
          authed = true;
          socket.write(ok(id, 'auth', { status: 'ok' }));
          continue;
        }

        if (!cmd) {
          socket.write(err(id, 'bad_request', 'cmd is required'));
          continue;
        }
        const handler = commands[cmd];
        if (!handler) {
          socket.write(err(id, 'bad_request', 'unknown command'));
          continue;
        }

        try {
          const result = await handler(args || {});
          socket.write(ok(id, cmd, result));
          if (cmd === 'quit') socket.end();
        } catch (e) {
          const code = e.code || 'internal_error';
          socket.write(err(id, code, e.message || 'error'));
        }
      }
    });
  });

  await new Promise((resolve, reject) => {
    server.listen(config.port, config.host, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return { host: config.host, port: config.port };
}

