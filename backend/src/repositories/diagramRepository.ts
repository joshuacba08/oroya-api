import { DatabaseSync } from "node:sqlite";
import { getDatabase } from "../config/database";

export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    entity: {
      id: string;
      name: string;
      description?: string;
    };
    fields: Array<{
      id: string;
      name: string;
      type: string;
      is_required: boolean;
      is_unique: boolean;
      default_value?: string;
      max_length?: number;
      description?: string;
    }>;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  data?: {
    relationship: string;
    sourceCardinality: string;
    targetCardinality: string;
  };
}

export interface DiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export class DiagramRepository {
  private getDb(): DatabaseSync {
    return getDatabase();
  }

  /**
   * Genera la estructura de diagrama UML para un proyecto específico
   */
  generateUMLDiagram(projectId: string): Promise<DiagramData> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = this.getDb();

        // Obtener todas las entidades del proyecto
        const entitiesQuery =
          "SELECT * FROM entities WHERE project_id = ? ORDER BY name";
        const entitiesStmt = db.prepare(entitiesQuery);
        const entities = entitiesStmt.all(projectId) as Array<{
          id: string;
          project_id: string;
          name: string;
          description?: string;
          created_at: string;
          updated_at: string;
        }>;

        const nodes: DiagramNode[] = [];
        const edges: DiagramEdge[] = [];

        // Generar nodos para cada entidad
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];

          // Obtener campos de la entidad
          const fieldsQuery =
            "SELECT * FROM fields WHERE entity_id = ? ORDER BY name";
          const fieldsStmt = db.prepare(fieldsQuery);
          const fields = fieldsStmt.all(entity.id) as Array<{
            id: string;
            entity_id: string;
            name: string;
            type: string;
            is_required: boolean;
            is_unique: boolean;
            default_value?: string;
            max_length?: number;
            description?: string;
          }>;

          // Calcular posición del nodo (distribución en cuadrícula)
          const nodeWidth = 300;
          const nodeHeight = 200;
          const spacing = 50;
          const cols = Math.ceil(Math.sqrt(entities.length));
          const row = Math.floor(i / cols);
          const col = i % cols;

          const x = col * (nodeWidth + spacing);
          const y = row * (nodeHeight + spacing);

          const node: DiagramNode = {
            id: entity.id,
            type: "entityNode",
            position: { x, y },
            data: {
              label: entity.name,
              entity: {
                id: entity.id,
                name: entity.name,
                description: entity.description,
              },
              fields: fields.map((field) => ({
                id: field.id,
                name: field.name,
                type: field.type,
                is_required: field.is_required,
                is_unique: field.is_unique,
                default_value: field.default_value,
                max_length: field.max_length,
                description: field.description,
              })),
            },
          };

          nodes.push(node);
        }

        // Generar edges para relaciones basadas en campos que referencian otras entidades
        // Esto es una aproximación básica. Se puede mejorar con más información de relaciones
        for (const entity of entities) {
          const fieldsQuery = "SELECT * FROM fields WHERE entity_id = ?";
          const fieldsStmt = db.prepare(fieldsQuery);
          const fields = fieldsStmt.all(entity.id) as Array<{
            id: string;
            entity_id: string;
            name: string;
            type: string;
            is_required: boolean;
            is_unique: boolean;
            default_value?: string;
            max_length?: number;
            description?: string;
          }>;

          // Buscar campos que puedan ser foreign keys (campos que terminan en _id)
          for (const field of fields) {
            if (field.name.endsWith("_id") && field.name !== "id") {
              // Intentar encontrar la entidad referenciada
              const referencedEntityName = field.name.replace("_id", "");
              const referencedEntity = entities.find(
                (e) =>
                  e.name.toLowerCase() === referencedEntityName.toLowerCase() ||
                  e.name.toLowerCase() ===
                    referencedEntityName.toLowerCase() + "s" ||
                  e.name.toLowerCase() ===
                    referencedEntityName.toLowerCase().slice(0, -1)
              );

              if (referencedEntity) {
                const edge: DiagramEdge = {
                  id: `${entity.id}-${referencedEntity.id}-${field.id}`,
                  source: entity.id,
                  target: referencedEntity.id,
                  type: "smoothstep",
                  label: field.name,
                  data: {
                    relationship: "belongs_to",
                    sourceCardinality: "many",
                    targetCardinality: "one",
                  },
                };
                edges.push(edge);
              }
            }
          }
        }

        const diagramData: DiagramData = {
          nodes,
          edges,
          viewport: {
            x: 0,
            y: 0,
            zoom: 1,
          },
        };

        resolve(diagramData);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtiene información detallada de las relaciones entre entidades
   */
  getEntityRelationships(projectId: string): Promise<
    Array<{
      source_entity: string;
      target_entity: string;
      field_name: string;
      relationship_type: string;
    }>
  > {
    return new Promise((resolve, reject) => {
      try {
        const db = this.getDb();

        const query = `
          SELECT 
            e1.name as source_entity,
            e2.name as target_entity,
            f.name as field_name,
            'belongs_to' as relationship_type
          FROM fields f
          JOIN entities e1 ON f.entity_id = e1.id
          JOIN entities e2 ON (
            f.name LIKE '%_id' AND 
            (LOWER(e2.name) = LOWER(SUBSTR(f.name, 1, LENGTH(f.name) - 3)) OR
             LOWER(e2.name) = LOWER(SUBSTR(f.name, 1, LENGTH(f.name) - 3)) || 's' OR
             LOWER(e2.name) = SUBSTR(LOWER(SUBSTR(f.name, 1, LENGTH(f.name) - 3)), 1, LENGTH(SUBSTR(f.name, 1, LENGTH(f.name) - 3)) - 1))
          )
          WHERE e1.project_id = ? AND e2.project_id = ?
        `;

        const stmt = db.prepare(query);
        const relationships = stmt.all(projectId, projectId) as Array<{
          source_entity: string;
          target_entity: string;
          field_name: string;
          relationship_type: string;
        }>;

        resolve(relationships);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtiene estadísticas del proyecto para el diagrama
   */
  getProjectStats(projectId: string): Promise<{
    total_entities: number;
    total_fields: number;
    total_relationships: number;
    entity_types: Array<{ type: string; count: number }>;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = this.getDb();

        // Total de entidades
        const entitiesQuery =
          "SELECT COUNT(*) as count FROM entities WHERE project_id = ?";
        const entitiesStmt = db.prepare(entitiesQuery);
        const entitiesResult = entitiesStmt.get(projectId) as { count: number };

        // Total de campos
        const fieldsQuery = `
          SELECT COUNT(*) as count 
          FROM fields f 
          JOIN entities e ON f.entity_id = e.id 
          WHERE e.project_id = ?
        `;
        const fieldsStmt = db.prepare(fieldsQuery);
        const fieldsResult = fieldsStmt.get(projectId) as { count: number };

        // Total de relaciones
        const relationshipsQuery = `
          SELECT COUNT(*) as count 
          FROM fields f 
          JOIN entities e ON f.entity_id = e.id 
          WHERE e.project_id = ? AND f.name LIKE '%_id' AND f.name != 'id'
        `;
        const relationshipsStmt = db.prepare(relationshipsQuery);
        const relationshipsResult = relationshipsStmt.get(projectId) as {
          count: number;
        };

        // Tipos de campos más comunes
        const fieldTypesQuery = `
          SELECT f.type, COUNT(*) as count 
          FROM fields f 
          JOIN entities e ON f.entity_id = e.id 
          WHERE e.project_id = ? 
          GROUP BY f.type 
          ORDER BY count DESC
        `;
        const fieldTypesStmt = db.prepare(fieldTypesQuery);
        const fieldTypes = fieldTypesStmt.all(projectId) as Array<{
          type: string;
          count: number;
        }>;

        resolve({
          total_entities: entitiesResult.count,
          total_fields: fieldsResult.count,
          total_relationships: relationshipsResult.count,
          entity_types: fieldTypes,
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
