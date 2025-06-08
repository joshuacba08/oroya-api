import { DatabaseSync } from "node:sqlite";
import path from "path";

// Configuración de la base de datos
const DB_PATH = path.join(__dirname, "../../database.sqlite");

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

      db = new DatabaseSync(DB_PATH);
      console.log("Conectado a SQLite database.");

      // Habilitar foreign keys
      db.exec("PRAGMA foreign_keys = ON");
      console.log("Foreign keys habilitadas.");

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
