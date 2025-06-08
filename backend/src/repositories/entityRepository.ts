import { DatabaseSync } from "node:sqlite";
import { getDatabase } from "../config/database";

export interface Entity {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEntityData {
  project_id: string;
  name: string;
  description?: string;
}

export interface UpdateEntityData {
  name?: string;
  description?: string;
}

export class EntityRepository {
  private getDb(): DatabaseSync {
    return getDatabase();
  }

  /**
   * Crear una nueva entidad
   */
  create(id: string, data: CreateEntityData): Promise<Entity> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          INSERT INTO entities (id, project_id, name, description)
          VALUES (?, ?, ?, ?)
        `;

        const db = this.getDb();
        const stmt = db.prepare(query);
        stmt.run(id, data.project_id, data.name, data.description || null);

        // Obtener la entidad creada
        const selectQuery = "SELECT * FROM entities WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const entity = selectStmt.get(id) as Entity;

        resolve(entity);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener todas las entidades
   */
  findAll(): Promise<Entity[]> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT * FROM entities ORDER BY created_at DESC";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const entities = stmt.all() as Entity[];

        resolve(entities);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener entidades por proyecto ID
   */
  findByProjectId(projectId: string): Promise<Entity[]> {
    return new Promise((resolve, reject) => {
      try {
        const query =
          "SELECT * FROM entities WHERE project_id = ? ORDER BY created_at DESC";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const entities = stmt.all(projectId) as Entity[];

        resolve(entities);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener una entidad por ID
   */
  findById(id: string): Promise<Entity | null> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT * FROM entities WHERE id = ?";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const entity = stmt.get(id) as Entity | undefined;

        resolve(entity || null);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Actualizar una entidad
   */
  update(id: string, data: UpdateEntityData): Promise<Entity | null> {
    return new Promise((resolve, reject) => {
      try {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
          fields.push("name = ?");
          values.push(data.name);
        }

        if (data.description !== undefined) {
          fields.push("description = ?");
          values.push(data.description);
        }

        if (fields.length === 0) {
          // Si no hay campos para actualizar, devolver la entidad actual
          this.findById(id).then(resolve).catch(reject);
          return;
        }

        values.push(id);
        const query = `UPDATE entities SET ${fields.join(", ")} WHERE id = ?`;

        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.run(...values);

        if (result.changes === 0) {
          resolve(null); // Entidad no encontrada
          return;
        }

        // Obtener la entidad actualizada
        const selectQuery = "SELECT * FROM entities WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const entity = selectStmt.get(id) as Entity;

        resolve(entity);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Eliminar una entidad
   */
  delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "DELETE FROM entities WHERE id = ?";
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
   * Verificar si una entidad existe
   */
  exists(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT 1 FROM entities WHERE id = ? LIMIT 1";
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
   * Verificar si una entidad pertenece a un proyecto
   */
  belongsToProject(entityId: string, projectId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query =
          "SELECT 1 FROM entities WHERE id = ? AND project_id = ? LIMIT 1";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.get(entityId, projectId);

        resolve(!!result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
