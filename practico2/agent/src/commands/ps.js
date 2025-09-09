// ps: lista procesos del sistema (pid, comando, CPU%, MEM%) usando 'ps'
import { exec } from 'child_process';

export default function psFactory() {
  return function() {
    return new Promise((resolve, reject) => {
      exec('ps -eo pid,comm,pcpu,pmem --no-headers', { timeout: 3000 }, (err, stdout) => {
        if (err) return reject(err);
        const lines = stdout.trim().split('\n').filter(Boolean);
        resolve(lines.map(l => {
          const [pid, command, cpu, mem] = l.trim().split(/\s+/, 4);
          return { pid: Number(pid), command, cpu: Number(cpu), mem: Number(mem) };
        }));
      });
    });
  };
}
