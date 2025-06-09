#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Obtiene el directorio de datos de usuario apropiado para cada OS
 */
const getUserDataPath = () => {
  const platform = os.platform();
  const appName = "OroyaAPI";

  switch (platform) {
    case "win32":
      return path.join(os.homedir(), "AppData", "Roaming", appName);
    case "darwin":
      return path.join(os.homedir(), "Library", "Application Support", appName);
    case "linux":
      return path.join(os.homedir(), ".config", appName);
    default:
      return path.join(os.homedir(), `.${appName}`);
  }
};

/**
 * Obtiene la ruta de la base de datos según el entorno
 */
const getDatabasePath = (isProduction = false) => {
  if (!isProduction) {
    return path.join(__dirname, "../database.sqlite");
  }

  const userDataPath = getUserDataPath();
  return path.join(userDataPath, "database.sqlite");
};

/**
 * Comandos disponibles
 */
const commands = {
  info: () => {
    console.log("📊 Información de Base de Datos\n");
    console.log(`🖥️  Plataforma: ${os.platform()}`);
    console.log(`👤 Usuario: ${os.userInfo().username}`);
    console.log(`🏠 Home: ${os.homedir()}\n`);

    console.log("📁 Rutas de Base de Datos:");
    console.log(`   Desarrollo: ${getDatabasePath(false)}`);
    console.log(`   Producción: ${getDatabasePath(true)}\n`);

    console.log("📂 Directorio de datos de usuario:");
    console.log(`   ${getUserDataPath()}\n`);

    // Verificar si existen
    const devPath = getDatabasePath(false);
    const prodPath = getDatabasePath(true);

    console.log("✅ Estado de archivos:");
    console.log(
      `   Desarrollo: ${fs.existsSync(devPath) ? "✅ Existe" : "❌ No existe"}`
    );
    console.log(
      `   Producción: ${fs.existsSync(prodPath) ? "✅ Existe" : "❌ No existe"}`
    );
  },

  setup: () => {
    console.log("🔧 Configurando directorios...\n");

    const userDataPath = getUserDataPath();

    try {
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
        console.log(`✅ Directorio creado: ${userDataPath}`);
      } else {
        console.log(`ℹ️  Directorio ya existe: ${userDataPath}`);
      }

      // Verificar permisos
      fs.accessSync(userDataPath, fs.constants.W_OK);
      console.log("✅ Permisos de escritura verificados");
    } catch (error) {
      console.error(`❌ Error configurando directorio: ${error.message}`);
      process.exit(1);
    }
  },

  migrate: () => {
    console.log("🔄 Migrando base de datos de desarrollo a producción...\n");

    const devPath = getDatabasePath(false);
    const prodPath = getDatabasePath(true);
    const prodDir = path.dirname(prodPath);

    if (!fs.existsSync(devPath)) {
      console.error("❌ Base de datos de desarrollo no encontrada");
      process.exit(1);
    }

    try {
      // Crear directorio de producción si no existe
      if (!fs.existsSync(prodDir)) {
        fs.mkdirSync(prodDir, { recursive: true });
        console.log(`✅ Directorio de producción creado: ${prodDir}`);
      }

      // Copiar base de datos
      fs.copyFileSync(devPath, prodPath);
      console.log(`✅ Base de datos copiada a: ${prodPath}`);

      // Verificar copia
      const devStats = fs.statSync(devPath);
      const prodStats = fs.statSync(prodPath);

      if (devStats.size === prodStats.size) {
        console.log("✅ Migración completada exitosamente");
      } else {
        console.error("❌ Error en la migración: tamaños no coinciden");
      }
    } catch (error) {
      console.error(`❌ Error durante la migración: ${error.message}`);
      process.exit(1);
    }
  },

  backup: () => {
    console.log("💾 Creando backup de base de datos...\n");

    const prodPath = getDatabasePath(true);

    if (!fs.existsSync(prodPath)) {
      console.error("❌ Base de datos de producción no encontrada");
      process.exit(1);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = prodPath.replace(
      ".sqlite",
      `_backup_${timestamp}.sqlite`
    );

    try {
      fs.copyFileSync(prodPath, backupPath);
      console.log(`✅ Backup creado: ${backupPath}`);
    } catch (error) {
      console.error(`❌ Error creando backup: ${error.message}`);
      process.exit(1);
    }
  },

  clean: () => {
    console.log("🧹 Limpiando archivos temporales...\n");

    const userDataPath = getUserDataPath();
    const tempPath = path.join(os.tmpdir(), "OroyaAPI");

    const cleanDir = (dirPath, name) => {
      if (fs.existsSync(dirPath)) {
        try {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(`✅ ${name} limpiado: ${dirPath}`);
        } catch (error) {
          console.error(`❌ Error limpiando ${name}: ${error.message}`);
        }
      } else {
        console.log(`ℹ️  ${name} no existe: ${dirPath}`);
      }
    };

    // Solo limpiar directorio temporal, no el de datos de usuario
    cleanDir(tempPath, "Directorio temporal");
  },

  help: () => {
    console.log("🛠️  Utilidades de Base de Datos - OroyaAPI\n");
    console.log("Comandos disponibles:");
    console.log("  info     - Mostrar información de configuración");
    console.log("  setup    - Configurar directorios necesarios");
    console.log("  migrate  - Migrar DB de desarrollo a producción");
    console.log("  backup   - Crear backup de la base de datos");
    console.log("  clean    - Limpiar archivos temporales");
    console.log("  help     - Mostrar esta ayuda\n");
    console.log("Uso: node database-utils.js <comando>");
  },
};

// Ejecutar comando
const command = process.argv[2];

if (!command || !commands[command]) {
  commands.help();
  if (command) {
    console.error(`\n❌ Comando desconocido: ${command}`);
    process.exit(1);
  }
} else {
  commands[command]();
}
