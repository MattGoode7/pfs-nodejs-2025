// Intenta parsear una línea NDJSON recibida por el protocolo TCP.
// Devuelve el objeto JSON si es válido, null si la línea está vacía,
// o un objeto con _parseError si ocurre un error de parseo.
export function tryParseLine(line) {
    try {
      if (!line || !line.trim()) return null;
      return JSON.parse(line);
    } catch {
      return { _parseError: true };
    }
}

// Construye una respuesta exitosa en formato NDJSON para enviar al cliente.
// Incluye el id de la solicitud, el comando ejecutado y el contenido de la respuesta.
export function ok(id, command, content) {
    return JSON.stringify({ id, ok: true, command, content }) + '\n';
}

// Construye una respuesta de error en formato NDJSON para enviar al cliente.
// Incluye el id de la solicitud, un código de error y el mensaje descriptivo.
export function err(id, code, message) {
    return JSON.stringify({ id, ok: false, code, error: message }) + '\n';
}
  
