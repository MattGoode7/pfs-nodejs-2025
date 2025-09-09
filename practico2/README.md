# Practico 2 - Comunicación TCP en Node.js

## Descripción general

Este proyecto implementa un sistema cliente-servidor basado en **TCP** utilizando Node.js.  
El objetivo es crear un **agente remoto** que pueda ejecutar comandos específicos en el servidor bajo un protocolo definido, y un **cliente interactivo** que permita enviar solicitudes y visualizar respuestas.

El proyecto está dividido en dos componentes principales:

- **Agente (Server)**: proceso TCP que escucha conexiones, valida autenticación mediante un token y responde a los comandos solicitados.
- **Cliente**: aplicación de consola que se conecta al agente, envía solicitudes en formato JSON y muestra los resultados.

---

## Estructura del proyecto

```
tcp-agent/
├─ agent/
│  └─ src/
│     ├─ index.js          # Punto de entrada del agente
│     ├─ server.js         # Servidor TCP y gestión de protocolo
│     ├─ protocol.js       # Manejo de mensajes JSON (requests/responses)
│     ├─ config/
│     │  ├─ config.json    # Configuración del agente
│     │  └─ tokens.json    # Tokens válidos para autenticación
│     ├─ services/         # Lógica interna
│     │  ├─ sampler.js     # Muestreo periódico de CPU y memoria
│     │  ├─ watchManager.js# Gestión de monitoreo de directorios
│     │  ├─ tokenStore.js  # Carga y validación de tokens
│     │  └─ security.js    # Validaciones de seguridad (IP, whitelist)
│     └─ commands/         # Implementación modular de cada comando
│     └─ data/             # Guarda los watchesId y eventos de monitoreo (wacthesId)
└─ client/
   └─ src/
      └─ client.js         # Cliente interactivo TCP
```

---

## Protocolo

El cliente y el agente se comunican mediante mensajes en **formato JSON por línea** (NDJSON).  
Cada mensaje incluye un identificador (`id`), un comando (`cmd`) y, opcionalmente, argumentos (`args`).  
Las respuestas incluyen el mismo `id` y un campo `ok` que indica éxito o error.

### Ejemplo de request (cliente → agente)
```json
{"id":"1","cmd":"ps"}
```

### Ejemplo de response (agente → cliente)
```json
{"id":"1","ok":true,"command":"ps","content":[{"pid":123,"command":"node","cpu":0.0,"mem":0.1}]}
```

---

## Comandos disponibles

**help**  
Muestra la lista de comandos disponibles y sus usos.

**getosinfo time**  
Devuelve métricas de CPU y memoria libre tomadas en intervalos de 30 segundos, filtradas por la ventana de tiempo solicitada (en segundos).

**watch path [time]**  
Inicia un monitoreo de cambios en un directorio. Devuelve un `watchId` que identifica el seguimiento. El watchId correspondiente junto con sus datos se almacena en un json con un identificador único en la carpeta `data`.

**getwatches <watchId> | getwatches -a**  
Devuelve los eventos registrados para un `watchId` específico o lista todos los `watchIds` disponibles con la opción `-a`. Los `watchIds` se almacenan como archivos JSON en la carpeta `data`.

**ps**  
Lista los procesos en ejecución en el servidor.

**oscmd "comando" [args]**  
Ejecuta un comando del sistema, únicamente si está dentro de la lista blanca definida en `config.json`.

**quit**  
Finaliza la conexión con el agente.

---

## Autenticación

- El agente requiere un **token válido** para habilitar comandos.
- Los tokens permitidos están en `agent/src/config/tokens.json`.
- El cliente envía este token en el primer mensaje (`type: "auth"`).
- Sin un token válido, el servidor responde con error `unauthorized`.

---

## Ejecución

1. Abrir una primera terminal y ejecutar el agente:
   ```bash
   cd ~/tcp-agent/agent/src
   node index.js
   ```

2. Abrir una segunda terminal y ejecutar el cliente:
   ```bash
   cd ~/tcp-agent/client/src
   node client.js
   ```

3. En el cliente interactivo, se pueden ejecutar comandos como:
   ```
   agent> getosinfo 300
   agent> ps
   agent> watch /tmp 60
   agent> getwatches -a
   agent> getwatches <id>
   agent> oscmd uptime
   agent> quit
   ```

---

## Consideraciones de seguridad

- La autenticación se basa en tokens estáticos predefinidos.
- El servidor restringe la ejecución de comandos del sistema a un **whitelist**.
- Se permite restringir conexiones por dirección IP en `config.json`.
- El monitoreo de directorios (`fs.watch`) guarda los watchesId en la carpeta data.