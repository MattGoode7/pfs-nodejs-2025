# pfs-nodejs-2025
Repositorio destinado a los prácticos de NodeJS de la materia Programación Funcional y Scripting.

## Práctico 1
- Módulo `fetchDB` en Node.js que permite configurar la cantidad de registros y el archivo destino para persistencia (`setPáginaCantidad`, `setFile`, `fetch`).
- `fetch()` obtiene usuarios desde `https://randomuser.me/api/` por la cantidad indicada, los agrega (append) a un archivo JSON (creándolo si no existe) y lo actualiza.
- CLI opcional con parámetros `-c <cantidad>` y `-f <pathToFile>` (por defecto: `-c 3 -f ./db.json`).

## Práctico 2
- Sistema cliente-servidor TCP con un agente remoto que autentica por token y ejecuta comandos bajo un protocolo JSON por línea.
- Comandos principales: `getosinfo <segundos>` (muestras de CPU/Mem), `watch <path> [seg]` y `getwatches` (monitoreo de cambios y consulta por id), `ps` (procesos), `oscmd` (comandos del SO con whitelist) y `quit`.
- El agente guarda datos de watches en archivos JSON y valida tokens definidos en `agent/src/config/tokens.json`.
