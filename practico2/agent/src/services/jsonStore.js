/**
 * JsonStore
 * Servicio de persistencia simple para "watches" usando archivos JSON en disco.
 * - Asegura la existencia del directorio base.
 * - Crea, lee y escribe registros de watch por su watchId (<watchId>.json).
 * - Permite anexar eventos a un watch y marcarlo como expirado.
 * - Incluye un método para listar todos los watchIds almacenados.
 */
import fs from 'fs';
import path from 'path';

export class JsonStore {
  constructor(baseDir) {
    this.baseDir = path.resolve(baseDir);
    this.ensureDir(this.baseDir);
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  watchPath(watchId) {
    return path.join(this.baseDir, `${watchId}.json`);
  }

  // Crea el registro inicial del watch
  createWatchRecord(watchId, record) {
    const p = this.watchPath(watchId);
    fs.writeFileSync(p, JSON.stringify(record, null, 2), 'utf8');
  }

  // Lee un watch (si existe)
  readWatchRecord(watchId) {
    const p = this.watchPath(watchId);
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  }

  // Persiste cambios del watch (overwrite sencillo)
  writeWatchRecord(watchId, record) {
    const p = this.watchPath(watchId);
    fs.writeFileSync(p, JSON.stringify(record, null, 2), 'utf8');
  }

  // Atajo para append de eventos
  appendEvent(watchId, evt) {
    const rec = this.readWatchRecord(watchId);
    if (!rec) return;
    rec.events = rec.events || [];
    rec.events.push(evt);
    // cota de seguridad por tamaño
    if (rec.events.length > 5000) rec.events.splice(0, rec.events.length - 5000);
    this.writeWatchRecord(watchId, rec);
  }

  markExpired(watchId) {
    const rec = this.readWatchRecord(watchId);
    if (!rec) return;
    rec.expired = true;
    rec.expiredAt = Math.floor(Date.now()/1000);
    this.writeWatchRecord(watchId, rec);
  }

  listWatchIds() {
    return fs.readdirSync(this.baseDir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace(/\.json$/,''));
  }
}

