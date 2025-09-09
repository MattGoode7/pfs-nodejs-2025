/**
 * WatchManager
 * Administra monitoreos (fs.watch) de directorios por tiempo limitado.
 * - startWatch(path, seconds): inicia un watch con límite de tiempo; persiste en JsonStore
 *   su metadata y anexa eventos (creación/cambio/borrado) a medida que ocurren.
 * - getEvents(watchId): devuelve eventos del watch, ya sea activo (memoria) o histórico (JSON).
 * - Al expirar, cierra el watcher, marca el watch como expirado en disco y lo quita de memoria.
 */
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

export class WatchManager {
  constructor({ defaultSeconds, maxSeconds }, jsonStore) {
    this.defaultSeconds = defaultSeconds;
    this.maxSeconds = maxSeconds;
    this.store = jsonStore;            // << nuevo
    this.watches = new Map();          // activos en memoria
  }

  _genId() {
    return crypto.randomBytes(12).toString('hex');
  }

  startWatch(dirPath, seconds) {
    const sec = Math.min(Math.max(seconds || this.defaultSeconds, 1), this.maxSeconds);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      throw new Error('path must be a directory');
    }

    const watchId = this._genId();
    const events = [];
    const startedAt = Math.floor(Date.now()/1000);
    const expiresAt = startedAt + sec;

    // Crear registro en disco
    this.store.createWatchRecord(watchId, {
      watchId,
      path: dirPath,
      startedAt,
      expiresAt,
      expired: false,
      events: []
    });

    const watcher = fs.watch(dirPath, (eventType, file) => {
      const evt = {
        tipoEvento: eventType,
        archivo: file ? path.join(dirPath, file) : dirPath,
        tiempo: Math.floor(Date.now()/1000)
      };
      // memoria
      events.push(evt);
      if (events.length > 1000) events.shift();
      // persistencia
      this.store.appendEvent(watchId, evt);
    });

    const timeout = setTimeout(() => {
      try { watcher.close(); } catch {}
      // marcar como expirado en disco
      this.store.markExpired(watchId);
      // quitar de activos en memoria
      this.watches.delete(watchId);
    }, sec * 1000);

    this.watches.set(watchId, { events, watcher, expiresAt, path: dirPath, timeout });
    return { watchId, expiresAt };
  }

  // Devuelve eventos del watch, ya sea activo (memoria) o histórico (disco)
  getEvents(watchId) {
    const active = this.watches.get(watchId);
    if (active) {
      return active.events;
    }
    // Si no está activo, intentar cargar de disco
    const rec = this.store.readWatchRecord(watchId);
    if (!rec) {
      throw new Error('watch not found');
    }
    return rec.events || [];
  }

  // Lista todos los watchIds disponibles en almacenamiento (incluye activos e históricos)
  listWatchIds() {
    return this.store.listWatchIds();
  }
}

