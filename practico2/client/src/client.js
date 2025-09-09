// Cliente TCP interactivo: establece conexión, realiza auth por token,
// envía requests NDJSON (help, getosinfo, watch, getwatches, ps, oscmd, quit)
// y muestra respuestas formateadas (incluye impresión especial para help).
import net from 'net';
import readline from 'readline';

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 7070);
const TOKEN = process.env.TOKEN || 'DEV_TOKEN_123';

function send(socket, obj) {
  socket.write(JSON.stringify(obj) + '\n');
}

function nextId() {
  return Math.random().toString(36).slice(2);
}

/* ========== Helpers de impresión ========== */

function printHelp(commands) {
  const rows = Object.entries(commands).map(([name, info]) => ({
    cmd: name,
    usage: info?.usage || '',
    desc: info?.desc || ''
  }));

  const col1 = Math.max('Comando'.length, ...rows.map(r => r.cmd.length));
  const col2 = Math.max('Uso'.length, ...rows.map(r => r.usage.length));
  const col3 = 'Descripción'.length;

  const pad = (s, w) => s.padEnd(w, ' ');
  console.log('');
  console.log(
    pad('Comando', col1), '  ',
    pad('Uso', col2), '  ',
    'Descripción'
  );
  console.log(
    '-'.repeat(col1), '  ',
    '-'.repeat(col2), '  ',
    '-'.repeat(Math.max(col3, 20))
  );

  for (const r of rows) {
    console.log(
      pad(r.cmd, col1), '  ',
      pad(r.usage, col2), '  ',
      r.desc
    );
  }
  console.log('');
}

function printOk(msg) {
  // Impresión reducida para respuestas OK que no son "help"
  // Mostramos solo el command y content en una línea si es simple,
  // o el JSON pretty del content si es complejo.
  const { command, content } = msg;
  if (content == null || typeof content === 'string' || typeof content === 'number' || Array.isArray(content)) {
    console.log(`OK ${command}:`, typeof content === 'object' ? JSON.stringify(content, null, 2) : content);
  } else {
    console.log(`OK ${command}:`);
    console.log(JSON.stringify(content, null, 2));
  }
}

function printErr(msg) {
  const { code, error } = msg;
  console.error(`ERROR${code ? ` [${code}]` : ''}: ${error || 'desconocido'}`);
}

/* ========== CLI ========== */

function startCli(socket) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'agent> '});
  rl.prompt();

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return rl.prompt();

    const [cmd, ...rest] = trimmed.split(/\s+/);
    const id = nextId();

    if (cmd === 'help') {
      send(socket, { id, cmd: 'help' });

    } else if (cmd === 'getosinfo') {
      const time = Number(rest[0] || 3600);
      send(socket, { id, cmd, args: { time } });

    } else if (cmd === 'watch') {
      const p = rest[0];
      const t = Number(rest[1] || 60);
      send(socket, { id, cmd, args: { path: p, time: t } });

    } else if (cmd === 'getwatches') {
        const first = rest[0];
        if (first === '-a' || first === '--all') {
          send(socket, { id, cmd, args: { all: true } });
        } else {
          const watchId = first;
          send(socket, { id, cmd, args: { watchId } });
        }

    } else if (cmd === 'ps') {
      send(socket, { id, cmd });

    } else if (cmd === 'oscmd') {
      const c = rest[0];
      const args = rest.slice(1);
      send(socket, { id, cmd, args: { cmd: c, args } });

    } else if (cmd === 'quit') {
      send(socket, { id, cmd });

    } else {
      // Fallback: mandamos el cmd tal cual; sirve para no “perder” help ni aliases
      send(socket, { id, cmd, args: {} });
    }

    rl.prompt();
  });

  socket.on('data', (chunk) => {
    const lines = chunk.toString('utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }

      // Estilizado especial para `help`
      if (msg?.ok && msg?.command === 'help' && msg?.content?.commands) {
        printHelp(msg.content.commands);
        continue;
      }

      // Para el resto, impresión compacta
      if (msg?.ok) printOk(msg);
      else printErr(msg);
    }
  });

  socket.on('end', () => {
    console.log('Conexión cerrada');
    process.exit(0);
  });
}

/* ========== Boot ==========/ */

function main() {
  const socket = net.createConnection({ host: HOST, port: PORT }, () => {
    console.log(`Conectado a ${HOST}:${PORT}`);
    // Auth primero
    send(socket, { id: 'auth-1', type: 'auth', token: TOKEN });
  });

  socket.on('data', (chunk) => {
    const lines = chunk.toString('utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      if (msg.command === 'auth' && msg.ok) {
        console.log('Autenticado ✓');
        console.log('Ingresa "help" para ver la lista de comandos disponibles');
        startCli(socket);
      }
    }
  });

  socket.on('error', (e) => {
    console.error('Error de conexión:', e.message);
    process.exit(1);
  });
}

main();

