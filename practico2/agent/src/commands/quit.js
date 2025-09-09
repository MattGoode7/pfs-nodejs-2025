// quit: devuelve un mensaje de despedida y el servidor cierra la conexión del socket
export default function quitFactory() {
    return function() {
      return { message: 'bye' };
    };
  }
  