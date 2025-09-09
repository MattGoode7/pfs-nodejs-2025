// cli.js (CommonJS)
const fetchDB = require("./fetchDB");

// Parseo simple de args: -c cantidad -f pathtofile
function parseArgs(argv) {
  // Defaults
  const opts = { c: 3, f: "./db.json" };
  const args = argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-c" || a === "--cantidad") {
      const val = args[i + 1];
      if (val === undefined) throw new Error("Falta valor para -c/--cantidad");
      opts.c = Number(val);
      i++;
    } else if (a === "-f" || a === "--file") {
      const val = args[i + 1];
      if (val === undefined) throw new Error("Falta valor para -f/--file");
      opts.f = val;
      i++;
    } else if (a === "-h" || a === "--help") {
      printHelpAndExit();
    } else {
      // Ignorar argumentos no reconocidos
      console.warn(`Argumento no reconocido: ${a}`);
    }
  }
  return opts;
}

(async () => {
  try {
    const { c, f } = parseArgs(process.argv);

    // Configurar el módulo
    fetchDB.setPagina(c);
    fetchDB.setFile(f);

    // Ejecutar
    const result = await fetchDB.fetch();
    console.log(
      `OK: se agregaron ${result.agregados} registros a "${result.file}". Total ahora: ${result.total}.`
    );
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
})();
