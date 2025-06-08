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
              enum: ["string", "number", "boolean", "date"],
              description: "Tipo de dato del campo",
              example: "string",
            },
            required: {
              type: "boolean",
              description: "Si el campo es obligatorio",
              example: true,
            },
          },
        },
        Relation: {
          type: "object",
          required: ["entityId", "relatedEntityId", "relationType"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identificador único de la relación",
            },
            entityId: {
              type: "string",
              format: "uuid",
              description: "ID de la entidad origen",
            },
            relatedEntityId: {
              type: "string",
              format: "uuid",
              description: "ID de la entidad destino",
            },
            fieldId: {
              type: "string",
              format: "uuid",
              description: "ID del campo asociado a la relación",
            },
            relationType: {
              type: "string",
              enum: ["one-to-one", "one-to-many", "many-to-many"],
              description: "Tipo de relación",
              example: "one-to-many",
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
