// watch: inicia un monitoreo fs.watch sobre un directorio por N segundos y retorna { watchId, expiresAt }
export default function watchFactory(watchManager) {
    return function(args = {}) {
      const { path, time } = args;
      if (!path) throw new Error('path is required');
      return watchManager.startWatch(path, Number(time));
    };
  }
  