// oscmd: ejecuta un comando del sistema si está permitido por la whitelist de config
import { execFile } from 'child_process';

export default function oscmdFactory({ whitelist }) {
  return function(args = {}) {
    const { cmd, args: cmdArgs = [] } = args;
    if (!cmd) throw new Error('cmd is required');
    if (!whitelist.includes(cmd)) {
      const e = new Error('command not allowed');
      e.code = 'forbidden';
      throw e;
    }
    return new Promise((resolve, reject) => {
      execFile(cmd, cmdArgs, { timeout: 3000 }, (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        resolve({ stdout: stdout.trim() });
      });
    });
  };
}
