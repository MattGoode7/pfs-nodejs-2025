/**
 * tokenStore.js
 * Carga y valida tokens de autenticación desde config/tokens.json.
 * - loadTokens(): lee el archivo y guarda los tokens en memoria (Set) para acceso rápido.
 * - isValidToken(t): consulta si un token está habilitado.
 *
 * El servidor invoca `loadTokens()` al iniciar para habilitar la autenticación.
 */
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const tokensPath = path.join(__dirname, '..', 'config', 'tokens.json');

let tokens = new Set();

export function loadTokens() {
  try {
    const data = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    tokens = new Set(data.tokens || []);
  } catch {
    tokens = new Set();
  }
}

export function isValidToken(t) {
  return tokens.has(t);
}
