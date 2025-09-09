/**
 * Sampler
 * Servicio de muestreo periódico de métricas del sistema.
 * - Toma muestras de carga CPU (loadavg[0]) y memoria libre cada intervalSeconds.
 * - Mantiene una ventana deslizante de duración windowSeconds en memoria.
 * - Expone get({ timeSeconds }) para consultar muestras dentro de una ventana relativa.
 *
 * Pensado para alimentar el comando `getosinfo` con datos recientes de CPU/memoria.
 */
import os from 'os';

export class Sampler {
  constructor({ intervalSeconds, windowSeconds }) {
    this.intervalMs = intervalSeconds * 1000;
    this.windowMs = windowSeconds * 1000;
    this.samples = [];
    this.timer = null;
  }

  start() {
    this._takeSample();
    this.timer = setInterval(() => this._takeSample(), this.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  _takeSample() {
    const time = Math.floor(Date.now() / 1000);
    const cpu = os.loadavg()[0];
    const memFree = os.freemem();
    this.samples.push({ cpu, memFree, time });
    const cutoff = time - (this.windowMs / 1000);
    this.samples = this.samples.filter(s => s.time >= cutoff);
  }

  get({ timeSeconds }) {
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - timeSeconds;
    return this.samples.filter(s => s.time >= cutoff);
  }
}
