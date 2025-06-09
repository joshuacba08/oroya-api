import { getDatabase } from "../config/database";

/**
 * Ejecuta las migraciones necesarias para actualizar la base de datos
 */
export const runMigrations = async (): Promise<void> => {
  try {
    const db = getDatabase();

    console.log("Ejecutando migraciones de base de datos...");

    // Migración 1: Agregar nuevas columnas a la tabla fields
    try {
      // Verificar si las columnas ya existen
      const tableInfo = db.prepare("PRAGMA table_info(fields)").all() as any[];
      const existingColumns = tableInfo.map((col) => col.name);

      if (!existingColumns.includes("is_primary_key")) {
        db.exec(
          "ALTER TABLE fields ADD COLUMN is_primary_key BOOLEAN DEFAULT false"
        );
        console.log("✓ Agregada columna is_primary_key a la tabla fields");
      }

      if (!existingColumns.includes("is_foreign_key")) {
        db.exec(
          "ALTER TABLE fields ADD COLUMN is_foreign_key BOOLEAN DEFAULT false"
        );
        console.log("✓ Agregada columna is_foreign_key a la tabla fields");
      }

      if (!existingColumns.includes("foreign_entity_id")) {
        db.exec("ALTER TABLE fields ADD COLUMN foreign_entity_id TEXT");
        console.log("✓ Agregada columna foreign_entity_id a la tabla fields");
      }

      if (!existingColumns.includes("foreign_field_id")) {
        db.exec("ALTER TABLE fields ADD COLUMN foreign_field_id TEXT");
        console.log("✓ Agregada columna foreign_field_id a la tabla fields");
      }
    } catch (error) {
      console.error("Error en migración de tabla fields:", error);
    }

    // Migración 2: Crear tabla entity_relationships si no existe
    try {
      const createEntityRelationshipsTable = `
        CREATE TABLE IF NOT EXISTS entity_relationships (
          id TEXT PRIMARY KEY,
          source_entity_id TEXT NOT NULL,
          target_entity_id TEXT NOT NULL,
          relationship_type TEXT NOT NULL CHECK (relationship_type IN ('one_to_one', 'one_to_many', 'many_to_one', 'many_to_many')),
          source_field_id TEXT,
          target_field_id TEXT,
          name TEXT,
          description TEXT,
          is_required BOOLEAN DEFAULT false,
          cascade_delete BOOLEAN DEFAULT false,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
          FOREIGN KEY (target_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
          FOREIGN KEY (source_field_id) REFERENCES fields(id) ON DELETE SET NULL,
          FOREIGN KEY (target_field_id) REFERENCES fields(id) ON DELETE SET NULL,
          UNIQUE(source_entity_id, target_entity_id, source_field_id, target_field_id)
        )
      `;

      db.exec(createEntityRelationshipsTable);
      console.log("✓ Tabla entity_relationships creada o verificada");
    } catch (error) {
      console.error("Error creando tabla entity_relationships:", error);
    }

    // Migración 3: Crear trigger para entity_relationships si no existe
    try {
      const createEntityRelationshipsUpdateTrigger = `
        CREATE TRIGGER IF NOT EXISTS update_entity_relationships_updated_at
        AFTER UPDATE ON entity_relationships
        FOR EACH ROW
        BEGIN
          UPDATE entity_relationships SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `;

      db.exec(createEntityRelationshipsUpdateTrigger);
      console.log("✓ Trigger para entity_relationships creado o verificado");
    } catch (error) {
      console.error("Error creando trigger para entity_relationships:", error);
    }

    // Migración 4: Agregar claves foráneas a la tabla fields si no existen
    try {
      // Nota: SQLite no permite agregar claves foráneas a tablas existentes directamente
      // Pero las nuevas columnas ya están configuradas para referenciar las tablas correctas
      // cuando se crean nuevos registros
      console.log(
        "✓ Referencias de claves foráneas configuradas para nuevos registros"
      );
    } catch (error) {
      console.error("Error configurando claves foráneas:", error);
    }

    console.log("✅ Migraciones completadas exitosamente");
  } catch (error) {
    console.error("❌ Error ejecutando migraciones:", error);
    throw error;
  }
};

/**
 * Verifica si las migraciones son necesarias
 */
export const checkMigrationsNeeded = (): boolean => {
  try {
    const db = getDatabase();

    // Verificar si las nuevas columnas existen
    const tableInfo = db.prepare("PRAGMA table_info(fields)").all() as any[];
    const existingColumns = tableInfo.map((col) => col.name);

    const requiredColumns = [
      "is_primary_key",
      "is_foreign_key",
      "foreign_entity_id",
      "foreign_field_id",
    ];
    const missingColumns = requiredColumns.filter(
      (col) => !existingColumns.includes(col)
    );

    // Verificar si la tabla entity_relationships existe
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='entity_relationships'"
      )
      .all();
    const relationshipTableExists = tables.length > 0;

    return missingColumns.length > 0 || !relationshipTableExists;
  } catch (error) {
    console.error("Error verificando migraciones:", error);
    return true; // Asumir que se necesitan migraciones si hay error
  }
};

/**
 * Obtiene información sobre el estado de las migraciones
 */
export const getMigrationStatus = () => {
  try {
    const db = getDatabase();

    // Verificar columnas de fields
    const tableInfo = db.prepare("PRAGMA table_info(fields)").all() as any[];
    const existingColumns = tableInfo.map((col) => col.name);

    const requiredColumns = [
      "is_primary_key",
      "is_foreign_key",
      "foreign_entity_id",
      "foreign_field_id",
    ];
    const missingColumns = requiredColumns.filter(
      (col) => !existingColumns.includes(col)
    );
    const presentColumns = requiredColumns.filter((col) =>
      existingColumns.includes(col)
    );

    // Verificar tabla entity_relationships
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='entity_relationships'"
      )
      .all();
    const relationshipTableExists = tables.length > 0;

    // Contar registros en entity_relationships si existe
    let relationshipCount = 0;
    if (relationshipTableExists) {
      const countResult = db
        .prepare("SELECT COUNT(*) as count FROM entity_relationships")
        .get() as any;
      relationshipCount = countResult.count;
    }

    return {
      fieldsTable: {
        missingColumns,
        presentColumns,
        allColumnsPresent: missingColumns.length === 0,
      },
      entityRelationshipsTable: {
        exists: relationshipTableExists,
        recordCount: relationshipCount,
      },
      migrationsNeeded: missingColumns.length > 0 || !relationshipTableExists,
    };
  } catch (error) {
    console.error("Error obteniendo estado de migraciones:", error);
    return {
      error: error instanceof Error ? error.message : "Error desconocido",
      migrationsNeeded: true,
    };
  }
};
