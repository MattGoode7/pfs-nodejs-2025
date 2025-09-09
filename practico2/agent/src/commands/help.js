// help: devuelve la lista de comandos disponibles con su uso y descripción
export default function helpFactory() {
  return function() {
    return {
      commands: {
        help: {
          desc: "Muestra esta ayuda",
          usage: "help"
        },
        getosinfo: {
          desc: "Devuelve métricas de CPU y memoria en los últimos N segundos",
          usage: "getosinfo [segundos]"
        },
        watch: {
          desc: "Monitorea un directorio por un tiempo determinado (segundos)",
          usage: "watch <path> [time]"
        },
        getwatches: {
          desc: "Muestra eventos de un watch o lista todos los watchIds (-a)",
          usage: "getwatches <watchId> | getwatches -a"
        },
        ps: {
          desc: "Lista procesos en ejecución",
          usage: "ps"
        },
        oscmd: {
          desc: "Ejecuta un comando permitido del sistema",
          usage: "oscmd <cmd> [args]"
        },
        quit: {
          desc: "Finaliza la conexión",
          usage: "quit"
        }
      }
    };
  };
}

