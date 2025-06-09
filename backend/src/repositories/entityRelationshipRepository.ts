import { DatabaseSync } from "node:sqlite";
import { getDatabase } from "../config/database";

export type RelationshipType =
  | "one_to_one"
  | "one_to_many"
  | "many_to_one"
  | "many_to_many";

export interface EntityRelationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: RelationshipType;
  source_field_id?: string;
  target_field_id?: string;
  name?: string;
  description?: string;
  is_required: boolean;
  cascade_delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEntityRelationshipData {
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: RelationshipType;
  source_field_id?: string;
  target_field_id?: string;
  name?: string;
  description?: string;
  is_required?: boolean;
  cascade_delete?: boolean;
}

export interface UpdateEntityRelationshipData {
  relationship_type?: RelationshipType;
  source_field_id?: string;
  target_field_id?: string;
  name?: string;
  description?: string;
  is_required?: boolean;
  cascade_delete?: boolean;
}

export class EntityRelationshipRepository {
  private getDb(): DatabaseSync {
    return getDatabase();
  }

  /**
   * Crear una nueva relación entre entidades
   */
  create(
    id: string,
    data: CreateEntityRelationshipData
  ): Promise<EntityRelationship> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          INSERT INTO entity_relationships (
            id, source_entity_id, target_entity_id, relationship_type,
            source_field_id, target_field_id, name, description,
            is_required, cascade_delete
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const db = this.getDb();
        const stmt = db.prepare(query);
        stmt.run(
          id,
          data.source_entity_id,
          data.target_entity_id,
          data.relationship_type,
          data.source_field_id || null,
          data.target_field_id || null,
          data.name || null,
          data.description || null,
          data.is_required ? 1 : 0,
          data.cascade_delete ? 1 : 0
        );

        // Obtener la relación creada
        const selectQuery = "SELECT * FROM entity_relationships WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const relationship = selectStmt.get(id) as EntityRelationship;

        resolve(relationship);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener todas las relaciones
   */
  findAll(): Promise<EntityRelationship[]> {
    return new Promise((resolve, reject) => {
      try {
        const query =
          "SELECT * FROM entity_relationships ORDER BY created_at DESC";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const relationships = stmt.all() as EntityRelationship[];

        resolve(relationships);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener relaciones por entidad origen
   */
  findBySourceEntityId(sourceEntityId: string): Promise<EntityRelationship[]> {
    return new Promise((resolve, reject) => {
      try {
        const query =
          "SELECT * FROM entity_relationships WHERE source_entity_id = ? ORDER BY created_at DESC";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const relationships = stmt.all(sourceEntityId) as EntityRelationship[];

        resolve(relationships);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener relaciones por entidad destino
   */
  findByTargetEntityId(targetEntityId: string): Promise<EntityRelationship[]> {
    return new Promise((resolve, reject) => {
      try {
        const query =
          "SELECT * FROM entity_relationships WHERE target_entity_id = ? ORDER BY created_at DESC";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const relationships = stmt.all(targetEntityId) as EntityRelationship[];

        resolve(relationships);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener relaciones que involucran una entidad específica (como origen o destino)
   */
  findByEntityId(entityId: string): Promise<EntityRelationship[]> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          SELECT * FROM entity_relationships 
          WHERE source_entity_id = ? OR target_entity_id = ? 
          ORDER BY created_at DESC
        `;
        const db = this.getDb();
        const stmt = db.prepare(query);
        const relationships = stmt.all(
          entityId,
          entityId
        ) as EntityRelationship[];

        resolve(relationships);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener una relación por ID
   */
  findById(id: string): Promise<EntityRelationship | null> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT * FROM entity_relationships WHERE id = ?";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const relationship = stmt.get(id) as EntityRelationship | undefined;

        resolve(relationship || null);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Actualizar una relación
   */
  update(
    id: string,
    data: UpdateEntityRelationshipData
  ): Promise<EntityRelationship | null> {
    return new Promise((resolve, reject) => {
      try {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.relationship_type !== undefined) {
          fields.push("relationship_type = ?");
          values.push(data.relationship_type);
        }

        if (data.source_field_id !== undefined) {
          fields.push("source_field_id = ?");
          values.push(data.source_field_id);
        }

        if (data.target_field_id !== undefined) {
          fields.push("target_field_id = ?");
          values.push(data.target_field_id);
        }

        if (data.name !== undefined) {
          fields.push("name = ?");
          values.push(data.name);
        }

        if (data.description !== undefined) {
          fields.push("description = ?");
          values.push(data.description);
        }

        if (data.is_required !== undefined) {
          fields.push("is_required = ?");
          values.push(data.is_required ? 1 : 0);
        }

        if (data.cascade_delete !== undefined) {
          fields.push("cascade_delete = ?");
          values.push(data.cascade_delete ? 1 : 0);
        }

        if (fields.length === 0) {
          // Si no hay campos para actualizar, devolver la relación actual
          this.findById(id).then(resolve).catch(reject);
          return;
        }

        values.push(id);
        const query = `UPDATE entity_relationships SET ${fields.join(
          ", "
        )} WHERE id = ?`;

        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.run(...values);

        if (result.changes === 0) {
          resolve(null); // Relación no encontrada
          return;
        }

        // Obtener la relación actualizada
        const selectQuery = "SELECT * FROM entity_relationships WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const relationship = selectStmt.get(id) as EntityRelationship;

        resolve(relationship);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Eliminar una relación
   */
  delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "DELETE FROM entity_relationships WHERE id = ?";
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
   * Verificar si una relación existe
   */
  exists(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT 1 FROM entity_relationships WHERE id = ? LIMIT 1";
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
   * Verificar si ya existe una relación específica entre dos entidades
   */
  existsBetweenEntities(
    sourceEntityId: string,
    targetEntityId: string,
    excludeId?: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        let query = `
          SELECT 1 FROM entity_relationships 
          WHERE source_entity_id = ? AND target_entity_id = ?
        `;
        const params = [sourceEntityId, targetEntityId];

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

  /**
   * Obtener relaciones con información detallada de las entidades
   */
  findWithEntityDetails(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          SELECT 
            er.*,
            se.name as source_entity_name,
            te.name as target_entity_name,
            sf.name as source_field_name,
            tf.name as target_field_name
          FROM entity_relationships er
          LEFT JOIN entities se ON er.source_entity_id = se.id
          LEFT JOIN entities te ON er.target_entity_id = te.id
          LEFT JOIN fields sf ON er.source_field_id = sf.id
          LEFT JOIN fields tf ON er.target_field_id = tf.id
          ORDER BY er.created_at DESC
        `;

        const db = this.getDb();
        const stmt = db.prepare(query);
        const relationships = stmt.all();

        resolve(relationships);
      } catch (error) {
        reject(error);
      }
    });
  }
}
