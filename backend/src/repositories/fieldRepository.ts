import { DatabaseSync } from "node:sqlite";
import { getDatabase } from "../config/database";

export interface Field {
  id: string;
  entity_id: string;
  name: string;
  type: string;
  is_required: boolean;
  is_unique: boolean;
  default_value?: string;
  max_length?: number;
  description?: string;
  accepts_multiple?: boolean;
  max_file_size?: number;
  allowed_extensions?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFieldData {
  entity_id: string;
  name: string;
  type: string;
  is_required?: boolean;
  is_unique?: boolean;
  default_value?: string;
  max_length?: number;
  description?: string;
  accepts_multiple?: boolean;
  max_file_size?: number;
  allowed_extensions?: string;
}

export interface UpdateFieldData {
  name?: string;
  type?: string;
  is_required?: boolean;
  is_unique?: boolean;
  default_value?: string;
  max_length?: number;
  description?: string;
  accepts_multiple?: boolean;
  max_file_size?: number;
  allowed_extensions?: string;
}

export class FieldRepository {
  private getDb(): DatabaseSync {
    return getDatabase();
  }

  /**
   * Crear un nuevo campo
   */
  create(id: string, data: CreateFieldData): Promise<Field> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          INSERT INTO fields (
            id, entity_id, name, type, is_required, is_unique, 
            default_value, max_length, description, accepts_multiple,
            max_file_size, allowed_extensions
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const db = this.getDb();
        const stmt = db.prepare(query);
        stmt.run(
          id,
          data.entity_id,
          data.name,
          data.type,
          data.is_required ? 1 : 0,
          data.is_unique ? 1 : 0,
          data.default_value || null,
          data.max_length || null,
          data.description || null,
          data.accepts_multiple ? 1 : 0,
          data.max_file_size || null,
          data.allowed_extensions || null
        );

        // Obtener el campo creado
        const selectQuery = "SELECT * FROM fields WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const field = selectStmt.get(id) as Field;

        resolve(field);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener todos los campos
   */
  findAll(): Promise<Field[]> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT * FROM fields ORDER BY created_at DESC";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const fields = stmt.all() as Field[];

        resolve(fields);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener campos por entidad ID
   */
  findByEntityId(entityId: string): Promise<Field[]> {
    return new Promise((resolve, reject) => {
      try {
        const query =
          "SELECT * FROM fields WHERE entity_id = ? ORDER BY created_at ASC";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const fields = stmt.all(entityId) as Field[];

        resolve(fields);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener un campo por ID
   */
  findById(id: string): Promise<Field | null> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT * FROM fields WHERE id = ?";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const field = stmt.get(id) as Field | undefined;

        resolve(field || null);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Actualizar un campo
   */
  update(id: string, data: UpdateFieldData): Promise<Field | null> {
    return new Promise((resolve, reject) => {
      try {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
          fields.push("name = ?");
          values.push(data.name);
        }

        if (data.type !== undefined) {
          fields.push("type = ?");
          values.push(data.type);
        }

        if (data.is_required !== undefined) {
          fields.push("is_required = ?");
          values.push(data.is_required ? 1 : 0);
        }

        if (data.is_unique !== undefined) {
          fields.push("is_unique = ?");
          values.push(data.is_unique ? 1 : 0);
        }

        if (data.default_value !== undefined) {
          fields.push("default_value = ?");
          values.push(data.default_value);
        }

        if (data.max_length !== undefined) {
          fields.push("max_length = ?");
          values.push(data.max_length);
        }

        if (data.description !== undefined) {
          fields.push("description = ?");
          values.push(data.description);
        }

        if (data.accepts_multiple !== undefined) {
          fields.push("accepts_multiple = ?");
          values.push(data.accepts_multiple ? 1 : 0);
        }

        if (data.max_file_size !== undefined) {
          fields.push("max_file_size = ?");
          values.push(data.max_file_size);
        }

        if (data.allowed_extensions !== undefined) {
          fields.push("allowed_extensions = ?");
          values.push(data.allowed_extensions);
        }

        if (fields.length === 0) {
          // Si no hay campos para actualizar, devolver el campo actual
          this.findById(id).then(resolve).catch(reject);
          return;
        }

        values.push(id);
        const query = `UPDATE fields SET ${fields.join(", ")} WHERE id = ?`;

        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.run(...values);

        if (result.changes === 0) {
          resolve(null); // Campo no encontrado
          return;
        }

        // Obtener el campo actualizado
        const selectQuery = "SELECT * FROM fields WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const field = selectStmt.get(id) as Field;

        resolve(field);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Eliminar un campo
   */
  delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "DELETE FROM fields WHERE id = ?";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.run(id);

        resolve(result.changes > 0);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verificar si un campo existe
   */
  exists(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT 1 FROM fields WHERE id = ? LIMIT 1";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.get(id);

        resolve(!!result);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verificar si un campo pertenece a una entidad
   */
  belongsToEntity(fieldId: string, entityId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query =
          "SELECT 1 FROM fields WHERE id = ? AND entity_id = ? LIMIT 1";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.get(fieldId, entityId);

        resolve(!!result);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verificar si ya existe un campo con ese nombre en la entidad
   */
  existsByNameInEntity(
    name: string,
    entityId: string,
    excludeId?: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        let query = "SELECT 1 FROM fields WHERE name = ? AND entity_id = ?";
        const params = [name, entityId];

        if (excludeId) {
          query += " AND id != ?";
          params.push(excludeId);
        }

        query += " LIMIT 1";

        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.get(...params);

        resolve(!!result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
