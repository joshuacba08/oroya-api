import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "OroyaAPI Backend",
      version: "1.0.0",
      description: `
        Este módulo corresponde al backend de la aplicación **OroyaAPI**. 
        Está construido con Node.js y Express, y utiliza SQLite como base de datos local. 
        Permite crear proyectos, definir entidades dinámicas, asignar campos personalizados 
        y establecer relaciones entre entidades.
        
        ## Características principales:
        - Gestión de proyectos
        - Creación de entidades dinámicas
        - Definición de campos personalizados
        - Establecimiento de relaciones entre entidades
        - Sistema de logging y analytics avanzado
        - API RESTful completamente documentada
      `,
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Servidor de desarrollo",
      },
    ],
    components: {
      schemas: {
        Project: {
          type: "object",
          required: ["name"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identificador único del proyecto",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              description: "Nombre del proyecto",
              example: "Mi Proyecto API",
            },
            description: {
              type: "string",
              description: "Descripción opcional del proyecto",
              example: "Proyecto para gestionar usuarios y productos",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
              example: "2024-01-01T00:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Última modificación",
              example: "2024-01-01T00:00:00.000Z",
            },
          },
        },
        Entity: {
          type: "object",
          required: ["projectId", "name"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identificador único de la entidad",
              example: "123e4567-e89b-12d3-a456-426614174001",
            },
            projectId: {
              type: "string",
              format: "uuid",
              description: "ID del proyecto al que pertenece",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              description: "Nombre de la entidad",
              example: "User",
            },
            description: {
              type: "string",
              description: "Descripción de la entidad",
              example: "Entidad para gestionar usuarios del sistema",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Última modificación",
            },
          },
        },
        Field: {
          type: "object",
          required: ["entityId", "name", "type"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identificador único del campo",
            },
            entityId: {
              type: "string",
              format: "uuid",
              description: "ID de la entidad a la que pertenece",
            },
            name: {
              type: "string",
              description: "Nombre del campo",
              example: "email",
            },
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "boolean",
                "date",
                "text",
                "integer",
                "decimal",
                "file",
                "image",
                "document",
              ],
              description: "Tipo de dato del campo",
              example: "string",
            },
            is_required: {
              type: "boolean",
              description: "Si el campo es obligatorio",
              example: true,
            },
            is_unique: {
              type: "boolean",
              description: "Si el campo debe ser único",
              example: false,
            },
            is_primary_key: {
              type: "boolean",
              description: "Si el campo es clave primaria",
              example: false,
            },
            is_foreign_key: {
              type: "boolean",
              description: "Si el campo es clave foránea",
              example: false,
            },
            foreign_entity_id: {
              type: "string",
              format: "uuid",
              description: "ID de la entidad referenciada (si es FK)",
              nullable: true,
            },
            foreign_field_id: {
              type: "string",
              format: "uuid",
              description: "ID del campo referenciado (si es FK)",
              nullable: true,
            },
            default_value: {
              type: "string",
              description: "Valor por defecto del campo",
              nullable: true,
            },
            max_length: {
              type: "integer",
              description: "Longitud máxima para campos de texto",
              nullable: true,
            },
            description: {
              type: "string",
              description: "Descripción del campo",
              nullable: true,
            },
            accepts_multiple: {
              type: "boolean",
              description: "Si acepta múltiples valores (para archivos)",
              example: false,
            },
            max_file_size: {
              type: "integer",
              description: "Tamaño máximo de archivo en bytes",
              nullable: true,
            },
            allowed_extensions: {
              type: "string",
              description: "Extensiones permitidas separadas por comas",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Última modificación",
            },
          },
        },
        EntityRelationship: {
          type: "object",
          required: [
            "source_entity_id",
            "target_entity_id",
            "relationship_type",
          ],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identificador único de la relación",
            },
            source_entity_id: {
              type: "string",
              format: "uuid",
              description: "ID de la entidad origen",
            },
            target_entity_id: {
              type: "string",
              format: "uuid",
              description: "ID de la entidad destino",
            },
            relationship_type: {
              type: "string",
              enum: [
                "one_to_one",
                "one_to_many",
                "many_to_one",
                "many_to_many",
              ],
              description: "Tipo de relación",
              example: "one_to_many",
            },
            source_field_id: {
              type: "string",
              format: "uuid",
              description: "ID del campo en la entidad origen",
              nullable: true,
            },
            target_field_id: {
              type: "string",
              format: "uuid",
              description: "ID del campo en la entidad destino",
              nullable: true,
            },
            name: {
              type: "string",
              description: "Nombre de la relación",
              nullable: true,
            },
            description: {
              type: "string",
              description: "Descripción de la relación",
              nullable: true,
            },
            is_required: {
              type: "boolean",
              description: "Si la relación es requerida",
              example: false,
            },
            cascade_delete: {
              type: "boolean",
              description: "Si se debe eliminar en cascada",
              example: false,
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Última modificación",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Mensaje de error",
              example: "Recurso no encontrado",
            },
            message: {
              type: "string",
              description: "Descripción detallada del error",
              example: "El proyecto con ID especificado no existe",
            },
          },
        },
      },
    },
  },
  apis: ["./src/router/*.ts", "./src/router/**/*.ts"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };
