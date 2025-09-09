// fetchDB.js (CommonJS)
const fs = require("fs/promises");
const path = require("path");

// URL base de RandomUser
const RANDOM_USER_URL = "https://randomuser.me/api/";

class FetchDB {
  constructor() {
    this._cantidad = 3;
    this._filePath = path.resolve("./db.json");
  }

  setPagina(num) {
    const n = Number(num);
    if (!Number.isInteger(n) || n < 1) {
      throw new Error("setPagina(num): num debe ser un entero >= 1");
    }
    this._cantidad = n;
  }

  setFile(pathToFile) {
    if (typeof pathToFile !== "string" || !pathToFile.trim()) {
      throw new Error("setFile(pathToFile): pathToFile inválido");
    }
    this._filePath = path.resolve(pathToFile);
  }

  async _ensureFile() {
    // Crea la carpeta si no existe
    const dir = path.dirname(this._filePath);
    await fs.mkdir(dir, { recursive: true }).catch(() => {});

    try {
      const content = await fs.readFile(this._filePath, "utf8");
      // Debe ser JSON. Esperamos un arreglo.
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error("El contenido del archivo debe ser un arreglo JSON []");
      }
      return parsed;
    } catch (err) {
      // Si no existe, crearlo con []
      if (err.code === "ENOENT") {
        await fs.writeFile(this._filePath, "[]\n", "utf8");
        return [];
      }
      // Si existe pero está mal formado, propagar error claro
      if (err.name === "SyntaxError") {
        throw new Error(
          `El archivo "${this._filePath}" no contiene JSON válido.`
        );
      }
      throw err;
    }
  }

  async _fetchRandomUsers(cantidad) {
    const url = `${RANDOM_USER_URL}?results=${cantidad}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error al hacer fetch: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    // La API retorna { results: [...] }
    if (!data || !Array.isArray(data.results)) {
      throw new Error("Respuesta inesperada de randomuser.me");
    }
    return data.results;
  }

  async fetch() {
    // 1) Leer / crear archivo con []
    const currentArray = await this._ensureFile();

    // 2) Fetch a randomuser por cantidad
    const nuevos = await this._fetchRandomUsers(this._cantidad);

    // 3) Append y escribir
    const actualizado = currentArray.concat(nuevos);
    await fs.writeFile(
      this._filePath,
      JSON.stringify(actualizado, null, 2) + "\n",
      "utf8"
    );

    return {
      file: this._filePath,
      agregados: nuevos.length,
      total: actualizado.length,
    };
  }
}

module.exports = new FetchDB();
