/**
 * security.js
 * Utilidades de validación de seguridad usadas por el servidor:
 * - ipAllowed: valida si la IP remota está en una lista blanca (o permite todas si está vacía).
 * - oscmdAllowed: valida si un comando del sistema está permitido según whitelist de config.
 */
export function ipAllowed(remoteIp, whitelist) {
    if (!whitelist || whitelist.length === 0) return true;
    return whitelist.includes(remoteIp);
  }
  
  export function oscmdAllowed(cmd, whitelist) {
    return whitelist.includes(cmd);
  }
  