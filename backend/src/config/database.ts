import fs from "fs";
import { DatabaseSync } from "node:sqlite";
import os from "os";
import path from "path";

/**
 * Obtiene el directorio de datos de usuario apropiado para cada OS
 */
const getUserDataPath = (): string => {
  const platform = os.platform();
  const appName = "OroyaAPI";

  switch (platform) {
    case "win32":
      // Windows: %APPDATA%/OroyaAPI
      return path.join(os.homedir(), "AppData", "Roaming", appName);
    case "darwin":
      // macOS: ~/Library/Application Support/OroyaAPI
      return path.join(os.homedir(), "Library", "Application Support", appName);
    case "linux":
      // Linux: ~/.config/OroyaAPI
      return path.join(os.homedir(), ".config", appName);
    default:
      // Fallback: ~/.OroyaAPI
      return path.join(os.homedir(), `.${appName}`);
  }
};

/**
 * Asegura que el directorio de datos de usuario existe
 */
const ensureUserDataDirectory = (): string => {
  const userDataPath = getUserDataPath();

  try {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
      console.log(`Created user data directory: ${userDataPath}`);
    }

    // Verificar permisos de escritura
    fs.accessSync(userDataPath, fs.constants.W_OK);
    return userDataPath;
  } catch (error) {
    console.error(
      `Error accessing user data directory: ${userDataPath}`,
      error
    );

    // Fallback a directorio temporal
    const tempPath = path.join(os.tmpdir(), "OroyaAPI");
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    console.warn(`Using temporary directory as fallback: ${tempPath}`);
    return tempPath;
  }
};

/**
 * Obtiene la ruta de la base de datos
 */
const getDatabasePath = (): string => {
  // En modo desarrollo, usar la ruta relativa actual
  if (process.env.NODE_ENV === "development") {
    return path.join(__dirname, "../../database.sqlite");
  }

  // En producción/Electron, usar directorio de datos de usuario
  const userDataPath = ensureUserDataDirectory();
  return path.join(userDataPath, "database.sqlite");
};

// Configuración de la base de datos
const DB_PATH = getDatabasePath();

// Instancia de la base de datos
let db: DatabaseSync | null = null;

/**
 * Inicializa la conexión a SQLite
 */
export const initDatabase = (): Promise<DatabaseSync> => {
  return new Promise((resolve, reject) => {
    try {
      if (db) {
        resolve(db);
        return;
      }

      console.log(`Initializing database at: ${DB_PATH}`);

      // Asegurar que el directorio padre existe
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      db = new DatabaseSync(DB_PATH);
      console.log("Conectado a SQLite database.");

      // Configurar SQLite para mejor rendimiento y concurrencia
      db.exec("PRAGMA journal_mode = WAL");
      db.exec("PRAGMA synchronous = NORMAL");
      db.exec("PRAGMA cache_size = 1000");
      db.exec("PRAGMA foreign_keys = ON");
      db.exec("PRAGMA temp_store = MEMORY");

      console.log("SQLite configurado correctamente.");

      resolve(db);
    } catch (err) {
      console.error("Error conectando a SQLite:", err);
      reject(err);
    }
  });
};

/**
 * Obtiene la instancia de la base de datos
 */
export const getDatabase = (): DatabaseSync => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
};

/**
 * Cierra la conexión de la base de datos
 */
export const closeDatabase = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      if (!db) {
        resolve();
        return;
      }

      db.close();
      console.log("Conexión SQLite cerrada.");
      db = null;
      resolve();
    } catch (error) {
      console.error("Error cerrando la base de datos:", error);
      resolve(); // No rechazamos para permitir el cierre limpio
    }
  });
};

/**
 * Obtiene información sobre la configuración de la base de datos
 */
export const getDatabaseInfo = () => {
  return {
    path: DB_PATH,
    platform: os.platform(),
    userDataPath:
      process.env.NODE_ENV === "development"
        ? "N/A (development mode)"
        : getUserDataPath(),
    isDevelopment: process.env.NODE_ENV === "development",
  };
};

/**
 * Crea las tablas de la base de datos
 */
export const createTables = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();

      // Tabla de proyectos
      const createProjectsTable = `
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Tabla de entidades
      const createEntitiesTable = `
        CREATE TABLE IF NOT EXISTS entities (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
      `;

      // Tabla de campos
      const createFieldsTable = `
        CREATE TABLE IF NOT EXISTS fields (
          id TEXT PRIMARY KEY,
          entity_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          is_required BOOLEAN DEFAULT false,
          is_unique BOOLEAN DEFAULT false,
          default_value TEXT,
          max_length INTEGER,
          description TEXT,
          accepts_multiple BOOLEAN DEFAULT false,
          max_file_size INTEGER,
          allowed_extensions TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
        )
      `;

      // Tabla de archivos/imágenes
      const createFilesTable = `
        CREATE TABLE IF NOT EXISTS files (
          id TEXT PRIMARY KEY,
          original_name TEXT NOT NULL,
          filename TEXT NOT NULL,
          mimetype TEXT NOT NULL,
          size INTEGER NOT NULL,
          path TEXT NOT NULL,
          is_image BOOLEAN DEFAULT false,
          width INTEGER,
          height INTEGER,
          compressed_path TEXT,
          thumbnail_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Tabla de valores de campos con archivos (relación muchos a muchos)
      const createFieldFilesTable = `
        CREATE TABLE IF NOT EXISTS field_files (
          id TEXT PRIMARY KEY,
          field_id TEXT NOT NULL,
          record_id TEXT NOT NULL,
          file_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE,
          FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        )
      `;

      // Crear triggers para actualizar updated_at
      const createProjectsUpdateTrigger = `
        CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
        AFTER UPDATE ON projects
        FOR EACH ROW
        BEGIN
          UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `;

      const createEntitiesUpdateTrigger = `
        CREATE TRIGGER IF NOT EXISTS update_entities_updated_at
        AFTER UPDATE ON entities
        FOR EACH ROW  
        BEGIN
          UPDATE entities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `;

      const createFieldsUpdateTrigger = `
        CREATE TRIGGER IF NOT EXISTS update_fields_updated_at
        AFTER UPDATE ON fields
        FOR EACH ROW
        BEGIN
          UPDATE fields SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `;

      const createFilesUpdateTrigger = `
        CREATE TRIGGER IF NOT EXISTS update_files_updated_at
        AFTER UPDATE ON files
        FOR EACH ROW
        BEGIN
          UPDATE files SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `;

      // Ejecutar todas las queries
      database.exec(createProjectsTable);
      database.exec(createEntitiesTable);
      database.exec(createFieldsTable);
      database.exec(createFilesTable);
      database.exec(createFieldFilesTable);
      database.exec(createProjectsUpdateTrigger);
      database.exec(createEntitiesUpdateTrigger);
      database.exec(createFieldsUpdateTrigger);
      database.exec(createFilesUpdateTrigger);

      console.log("Todas las tablas creadas exitosamente.");
      resolve();
    } catch (error) {
      console.error("Error creando tablas:", error);
      reject(error);
    }
  });
};
