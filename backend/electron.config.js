/**
 * Configuración específica para Electron
 * Este archivo debe ser importado en el proceso principal de Electron
 */

const { app } = require("electron");
const path = require("path");
const fs = require("fs");

/**
 * Configuración de la aplicación para Electron
 */
const electronConfig = {
  // Configurar variables de entorno para producción
  setupEnvironment: () => {
    // Asegurar que estamos en modo producción
    process.env.NODE_ENV = "production";

    // Configurar el directorio de datos de usuario de Electron
    const userDataPath = app.getPath("userData");
    const appDataPath = path.join(userDataPath, "OroyaAPI");

    // Crear directorio si no existe
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }

    console.log(`Electron User Data Path: ${userDataPath}`);
    console.log(`App Data Path: ${appDataPath}`);

    return {
      userDataPath,
      appDataPath,
      databasePath: path.join(appDataPath, "database.sqlite"),
    };
  },

  // Configurar el backend para Electron
  setupBackend: async () => {
    try {
      // Importar y configurar la base de datos
      const { initDatabase, createTables } = require("./src/config/database");

      // Inicializar base de datos
      await initDatabase();
      console.log("✅ Database initialized for Electron");

      // Crear tablas si no existen
      await createTables();
      console.log("✅ Database tables created/verified");

      return true;
    } catch (error) {
      console.error("❌ Error setting up backend for Electron:", error);
      throw error;
    }
  },

  // Inicializar todo para Electron
  initialize: async () => {
    console.log("🚀 Initializing OroyaAPI for Electron...");

    try {
      // Configurar entorno
      const paths = electronConfig.setupEnvironment();

      // Configurar backend
      await electronConfig.setupBackend();

      console.log("✅ OroyaAPI initialized successfully for Electron");
      return paths;
    } catch (error) {
      console.error("❌ Failed to initialize OroyaAPI for Electron:", error);
      throw error;
    }
  },

  // Limpiar recursos al cerrar
  cleanup: async () => {
    try {
      const { closeDatabase } = require("./src/config/database");
      await closeDatabase();
      console.log("✅ Database connection closed");
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }
  },
};

module.exports = electronConfig;

/**
 * Ejemplo de uso en el proceso principal de Electron:
 *
 * const { app, BrowserWindow } = require('electron');
 * const electronConfig = require('./backend/electron.config');
 *
 * app.whenReady().then(async () => {
 *   try {
 *     // Inicializar OroyaAPI
 *     const paths = await electronConfig.initialize();
 *
 *     // Iniciar servidor backend (opcional, si quieres servidor HTTP)
 *     const backend = require('./backend/index');
 *
 *     // Crear ventana principal
 *     createWindow();
 *
 *   } catch (error) {
 *     console.error('Error initializing app:', error);
 *     app.quit();
 *   }
 * });
 *
 * app.on('before-quit', async () => {
 *   await electronConfig.cleanup();
 * });
 */
