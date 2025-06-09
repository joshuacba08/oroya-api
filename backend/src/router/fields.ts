import { Request, Response, Router } from "express";
import { EntityRepository } from "../repositories/entityRepository";
import { FieldRepository } from "../repositories/fieldRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { generateUUID } from "../utils/uuid";

const router = Router();
const fieldRepository = new FieldRepository();
const entityRepository = new EntityRepository();
const projectRepository = new ProjectRepository();

/**
 * @swagger
 * /api/entities/{entityId}/fields:
 *   get:
 *     summary: Obtener todos los campos de una entidad
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *     responses:
 *       200:
 *         description: Lista de campos de la entidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Field'
 *       404:
 *         description: Entidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/entities/:entityId/fields",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityId } = req.params;

      // Verificar que la entidad existe
      const entityExists = await entityRepository.exists(entityId);
      if (!entityExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada",
        });
        return;
      }

      // Obtener campos de la entidad
      const fields = await fieldRepository.findByEntityId(entityId);
      res.json(fields);
    } catch (error) {
      console.error("Error obtaining entity fields:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/entities/{entityId}/fields:
 *   post:
 *     summary: Crear un nuevo campo para una entidad
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del campo
 *                 example: "email"
 *               type:
 *                 type: string
 *                 enum: [string, number, boolean, date, text, integer, decimal, file, image, document]
 *                 description: Tipo de dato del campo
 *                 example: "string"
 *               required:
 *                 type: boolean
 *                 description: Si el campo es obligatorio
 *                 example: true
 *     responses:
 *       201:
 *         description: Campo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Field'
 *       400:
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/entities/:entityId/fields",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityId } = req.params;
      const {
        name,
        type,
        is_required,
        is_unique,
        is_primary_key,
        is_foreign_key,
        foreign_entity_id,
        foreign_field_id,
        default_value,
        max_length,
        description,
        accepts_multiple,
        max_file_size,
        allowed_extensions,
      } = req.body;

      if (!name || !type) {
        res.status(400).json({
          error: "Bad Request",
          message: "El name y type son requeridos",
        });
        return;
      }

      const validTypes = [
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
      ];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "Tipo de dato inválido. Tipos permitidos: string, number, boolean, date, text, integer, decimal, file, image, document",
        });
        return;
      }

      // Verificar que la entidad existe
      const entityExists = await entityRepository.exists(entityId);
      if (!entityExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada",
        });
        return;
      }

      // Verificar que no existe un campo con el mismo nombre en la entidad
      const fieldExists = await fieldRepository.existsByNameInEntity(
        name,
        entityId
      );
      if (fieldExists) {
        res.status(400).json({
          error: "Bad Request",
          message: "Ya existe un campo con ese nombre en la entidad",
        });
        return;
      }

      // Validaciones específicas para campos de archivo
      if (["file", "image", "document"].includes(type)) {
        if (max_file_size && max_file_size > 50 * 1024 * 1024) {
          // 50MB máximo
          res.status(400).json({
            error: "Bad Request",
            message: "El tamaño máximo de archivo no puede exceder 50MB",
          });
          return;
        }

        if (allowed_extensions && typeof allowed_extensions === "string") {
          const extensions = allowed_extensions
            .split(",")
            .map((ext) => ext.trim());
          const validExtensions = /^\.[a-zA-Z0-9]+$/;
          for (const ext of extensions) {
            if (!validExtensions.test(ext)) {
              res.status(400).json({
                error: "Bad Request",
                message:
                  "Las extensiones deben tener el formato .ext (ej: .jpg, .pdf)",
              });
              return;
            }
          }
        }
      }

      // Validaciones para claves foráneas
      if (is_foreign_key && foreign_entity_id) {
        const foreignEntityExists = await entityRepository.exists(
          foreign_entity_id
        );
        if (!foreignEntityExists) {
          res.status(404).json({
            error: "Not Found",
            message: "Entidad referenciada no encontrada",
          });
          return;
        }

        if (foreign_field_id) {
          const foreignFieldExists = await fieldRepository.exists(
            foreign_field_id
          );
          if (!foreignFieldExists) {
            res.status(404).json({
              error: "Not Found",
              message: "Campo referenciado no encontrado",
            });
            return;
          }

          // Verificar que el campo pertenece a la entidad referenciada
          const fieldBelongsToEntity = await fieldRepository.belongsToEntity(
            foreign_field_id,
            foreign_entity_id
          );
          if (!fieldBelongsToEntity) {
            res.status(400).json({
              error: "Bad Request",
              message:
                "El campo referenciado no pertenece a la entidad referenciada",
            });
            return;
          }
        }
      }

      // Crear campo en base de datos
      const fieldId = generateUUID();
      const field = await fieldRepository.create(fieldId, {
        entity_id: entityId,
        name,
        type,
        is_required: is_required || false,
        is_unique: is_unique || false,
        is_primary_key: is_primary_key || false,
        is_foreign_key: is_foreign_key || false,
        foreign_entity_id: foreign_entity_id || undefined,
        foreign_field_id: foreign_field_id || undefined,
        default_value: default_value || undefined,
        max_length: max_length || undefined,
        description: description || undefined,
        accepts_multiple: accepts_multiple || false,
        max_file_size: max_file_size || undefined,
        allowed_extensions: allowed_extensions || undefined,
      });

      res.status(201).json(field);
    } catch (error) {
      console.error("Error creating field:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/entities/{entityId}/fields:
 *   post:
 *     summary: Crear un nuevo campo para una entidad dentro de un proyecto
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del campo
 *                 example: "email"
 *               type:
 *                 type: string
 *                 enum: [string, number, boolean, date, text, integer, decimal, file, image, document]
 *                 description: Tipo de dato del campo
 *                 example: "string"
 *               required:
 *                 type: boolean
 *                 description: Si el campo es obligatorio
 *                 example: true
 *     responses:
 *       201:
 *         description: Campo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Field'
 *       400:
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proyecto o entidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/projects/:projectId/entities/:entityId/fields",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, entityId } = req.params;
      const {
        name,
        type,
        is_required,
        is_unique,
        default_value,
        max_length,
        description,
        accepts_multiple,
        max_file_size,
        allowed_extensions,
      } = req.body;

      if (!name || !type) {
        res.status(400).json({
          error: "Bad Request",
          message: "El name y type son requeridos",
        });
        return;
      }

      const validTypes = [
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
      ];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "Tipo de dato inválido. Tipos permitidos: string, number, boolean, date, text, integer, decimal, file, image, document",
        });
        return;
      }

      // Verificar que el proyecto existe
      const projectExists = await projectRepository.exists(projectId);
      if (!projectExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      // Verificar que la entidad existe y pertenece al proyecto
      const entity = await entityRepository.findById(entityId);
      if (!entity || entity.project_id !== projectId) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada en el proyecto especificado",
        });
        return;
      }

      // Verificar que no existe un campo con el mismo nombre en la entidad
      const fieldExists = await fieldRepository.existsByNameInEntity(
        name,
        entityId
      );
      if (fieldExists) {
        res.status(400).json({
          error: "Bad Request",
          message: "Ya existe un campo con ese nombre en la entidad",
        });
        return;
      }

      // Validaciones específicas para campos de archivo
      if (["file", "image", "document"].includes(type)) {
        if (max_file_size && max_file_size > 50 * 1024 * 1024) {
          // 50MB máximo
          res.status(400).json({
            error: "Bad Request",
            message: "El tamaño máximo de archivo no puede exceder 50MB",
          });
          return;
        }

        if (allowed_extensions && typeof allowed_extensions === "string") {
          const extensions = allowed_extensions
            .split(",")
            .map((ext) => ext.trim());
          const validExtensions = /^\.[a-zA-Z0-9]+$/;
          for (const ext of extensions) {
            if (!validExtensions.test(ext)) {
              res.status(400).json({
                error: "Bad Request",
                message:
                  "Las extensiones deben tener el formato .ext (ej: .jpg, .pdf)",
              });
              return;
            }
          }
        }
      }

      // Crear campo en base de datos
      const fieldId = generateUUID();
      const field = await fieldRepository.create(fieldId, {
        entity_id: entityId,
        name,
        type,
        is_required: is_required || false,
        is_unique: is_unique || false,
        default_value: default_value || undefined,
        max_length: max_length || undefined,
        description: description || undefined,
        accepts_multiple: accepts_multiple || false,
        max_file_size: max_file_size || undefined,
        allowed_extensions: allowed_extensions || undefined,
      });

      res.status(201).json(field);
    } catch (error) {
      console.error("Error creating field:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/entities/{entityId}/fields:
 *   get:
 *     summary: Obtener todos los campos de una entidad
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *     responses:
 *       200:
 *         description: Lista de campos de la entidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Field'
 *       404:
 *         description: Entidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/entities/:entityId/fields",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityId } = req.params;

      // Verificar que la entidad existe
      const entityExists = await entityRepository.exists(entityId);
      if (!entityExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada",
        });
        return;
      }

      // Obtener campos de la entidad
      const fields = await fieldRepository.findByEntityId(entityId);
      res.json(fields);
    } catch (error) {
      console.error("Error obtaining entity fields:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/entities/{entityId}/fields:
 *   get:
 *     summary: Obtener todos los campos de una entidad dentro de un proyecto
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *     responses:
 *       200:
 *         description: Lista de campos de la entidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Field'
 *       404:
 *         description: Proyecto o entidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/projects/:projectId/entities/:entityId/fields",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, entityId } = req.params;

      // Verificar que el proyecto existe
      const projectExists = await projectRepository.exists(projectId);
      if (!projectExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      // Verificar que la entidad existe y pertenece al proyecto
      const entity = await entityRepository.findById(entityId);
      if (!entity || entity.project_id !== projectId) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada en el proyecto especificado",
        });
        return;
      }

      // Obtener campos de la entidad
      const fields = await fieldRepository.findByEntityId(entityId);
      res.json(fields);
    } catch (error) {
      console.error("Error obtaining entity fields:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/fields/{fieldId}:
 *   put:
 *     summary: Actualizar un campo
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del campo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del campo
 *               type:
 *                 type: string
 *                 enum: [string, number, boolean, date]
 *                 description: Tipo de dato del campo
 *               required:
 *                 type: boolean
 *                 description: Si el campo es obligatorio
 *     responses:
 *       200:
 *         description: Campo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Field'
 *       400:
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:fieldId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldId } = req.params;
    const {
      name,
      type,
      is_required,
      is_unique,
      default_value,
      max_length,
      description,
    } = req.body;

    // Verificar que el campo existe
    const existingField = await fieldRepository.findById(fieldId);
    if (!existingField) {
      res.status(404).json({
        error: "Not Found",
        message: "Campo no encontrado",
      });
      return;
    }

    // Validar tipo si se proporciona
    if (type) {
      const validTypes = [
        "string",
        "number",
        "boolean",
        "date",
        "text",
        "integer",
        "decimal",
      ];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "Tipo de dato inválido. Tipos permitidos: string, number, boolean, date, text, integer, decimal",
        });
        return;
      }
    }

    // Verificar que no existe otro campo con el mismo nombre en la entidad (si se cambia el nombre)
    if (name && name !== existingField.name) {
      const fieldExists = await fieldRepository.existsByNameInEntity(
        name,
        existingField.entity_id,
        fieldId
      );
      if (fieldExists) {
        res.status(400).json({
          error: "Bad Request",
          message: "Ya existe un campo con ese nombre en la entidad",
        });
        return;
      }
    }

    // Actualizar campo
    const updatedField = await fieldRepository.update(fieldId, {
      name,
      type,
      is_required,
      is_unique,
      default_value,
      max_length,
      description,
    });

    if (!updatedField) {
      res.status(404).json({
        error: "Not Found",
        message: "Campo no encontrado",
      });
      return;
    }

    res.json(updatedField);
  } catch (error) {
    console.error("Error updating field:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Error interno del servidor",
    });
  }
});

/**
 * @swagger
 * /api/fields/{fieldId}:
 *   delete:
 *     summary: Eliminar un campo
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del campo
 *     responses:
 *       204:
 *         description: Campo eliminado exitosamente
 *       404:
 *         description: Campo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:fieldId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { fieldId } = req.params;

      // Eliminar campo
      const deleted = await fieldRepository.delete(fieldId);

      if (!deleted) {
        res.status(404).json({
          error: "Not Found",
          message: "Campo no encontrado",
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting field:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/entities/{entityId}/fields/{fieldId}:
 *   put:
 *     summary: Actualizar un campo específico de una entidad dentro de un proyecto
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del campo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del campo
 *               type:
 *                 type: string
 *                 enum: [string, number, boolean, date, text, integer, decimal, file, image, document]
 *                 description: Tipo de dato del campo
 *               required:
 *                 type: boolean
 *                 description: Si el campo es obligatorio
 *     responses:
 *       200:
 *         description: Campo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Field'
 *       400:
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proyecto, entidad o campo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/projects/:projectId/entities/:entityId/fields/:fieldId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, entityId, fieldId } = req.params;
      const {
        name,
        type,
        is_required,
        is_unique,
        default_value,
        max_length,
        description,
      } = req.body;

      // Verificar que el proyecto existe
      const projectExists = await projectRepository.exists(projectId);
      if (!projectExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      // Verificar que la entidad existe y pertenece al proyecto
      const entity = await entityRepository.findById(entityId);
      if (!entity || entity.project_id !== projectId) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada en el proyecto especificado",
        });
        return;
      }

      // Verificar que el campo existe y pertenece a la entidad
      const existingField = await fieldRepository.findById(fieldId);
      if (!existingField || existingField.entity_id !== entityId) {
        res.status(404).json({
          error: "Not Found",
          message: "Campo no encontrado en la entidad especificada",
        });
        return;
      }

      // Validar tipo si se proporciona
      if (type) {
        const validTypes = [
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
        ];
        if (!validTypes.includes(type)) {
          res.status(400).json({
            error: "Bad Request",
            message:
              "Tipo de dato inválido. Tipos permitidos: string, number, boolean, date, text, integer, decimal, file, image, document",
          });
          return;
        }
      }

      // Verificar que no existe otro campo con el mismo nombre en la entidad (si se cambia el nombre)
      if (name && name !== existingField.name) {
        const fieldExists = await fieldRepository.existsByNameInEntity(
          name,
          entityId,
          fieldId
        );
        if (fieldExists) {
          res.status(400).json({
            error: "Bad Request",
            message: "Ya existe un campo con ese nombre en la entidad",
          });
          return;
        }
      }

      // Actualizar campo
      const updatedField = await fieldRepository.update(fieldId, {
        name,
        type,
        is_required,
        is_unique,
        default_value,
        max_length,
        description,
      });

      if (!updatedField) {
        res.status(404).json({
          error: "Not Found",
          message: "Campo no encontrado",
        });
        return;
      }

      res.json(updatedField);
    } catch (error) {
      console.error("Error updating field:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/entities/{entityId}/fields/{fieldId}:
 *   delete:
 *     summary: Eliminar un campo específico de una entidad dentro de un proyecto
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la entidad
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del campo
 *     responses:
 *       204:
 *         description: Campo eliminado exitosamente
 *       404:
 *         description: Proyecto, entidad o campo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/projects/:projectId/entities/:entityId/fields/:fieldId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, entityId, fieldId } = req.params;

      // Verificar que el proyecto existe
      const projectExists = await projectRepository.exists(projectId);
      if (!projectExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      // Verificar que la entidad existe y pertenece al proyecto
      const entity = await entityRepository.findById(entityId);
      if (!entity || entity.project_id !== projectId) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada en el proyecto especificado",
        });
        return;
      }

      // Verificar que el campo existe y pertenece a la entidad
      const existingField = await fieldRepository.findById(fieldId);
      if (!existingField || existingField.entity_id !== entityId) {
        res.status(404).json({
          error: "Not Found",
          message: "Campo no encontrado en la entidad especificada",
        });
        return;
      }

      // Eliminar campo
      const deleted = await fieldRepository.delete(fieldId);

      if (!deleted) {
        res.status(404).json({
          error: "Not Found",
          message: "Campo no encontrado",
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting field:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/fields/{fieldId}:
 *   get:
 *     summary: Obtener un campo específico
 *     tags: [Fields]
 *     parameters:
 *       - in: path
 *         name: fieldId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del campo
 *     responses:
 *       200:
 *         description: Campo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Field'
 *       404:
 *         description: Campo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:fieldId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldId } = req.params;

    // Obtener campo específico
    const field = await fieldRepository.findById(fieldId);

    if (!field) {
      res.status(404).json({
        error: "Not Found",
        message: "Campo no encontrado",
      });
      return;
    }

    res.json(field);
  } catch (error) {
    console.error("Error obtaining field:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Error interno del servidor",
    });
  }
});

// UUID generation is now handled by the imported utility

export default router;
