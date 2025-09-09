// getwatches: si recibe -a/--all (o args.all) lista todos los watchIds; de lo contrario devuelve eventos del watchId
export default function getwatchesFactory(watchManager) {
  return function(args = {}) {
    const { watchId, all } = args;
    // Soportar flag -a / all para listar todos los watchIds
    if (all === true || watchId === '-a' || watchId === '--all') {
      return { watchIds: watchManager.listWatchIds() };
    }
    if (!watchId) throw new Error('watchId is required');
    return watchManager.getEvents(watchId);
  };
}
  