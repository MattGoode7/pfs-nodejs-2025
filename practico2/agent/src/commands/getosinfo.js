// getosinfo: devuelve muestras recientes de CPU y memoria del sampler
export default function getosinfoFactory(sampler) {
    return function(args = {}) {
      const time = Number(args.time) || 3600;
      return sampler.get({ timeSeconds: time });
    };
  }
  