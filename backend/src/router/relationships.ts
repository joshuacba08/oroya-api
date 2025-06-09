import { Request, Response, Router } from "express";
import {
  EntityRelationshipRepository,
  RelationshipType,
} from "../repositories/entityRelationshipRepository";
import { EntityRepository } from "../repositories/entityRepository";
import { FieldRepository } from "../repositories/fieldRepository";
import { generateUUID } from "../utils/uuid";

const router = Router();
const relationshipRepository = new EntityRelationshipRepository();
const entityRepository = new EntityRepository();
const fieldRepository = new FieldRepository();

/**
 * @swagger
 * /api/relationships:
 *   get:
 *     summary: Obtener todas las relaciones entre entidades
 *     tags: [Entity Relationships]
 *     responses:
 *       200:
 *         description: Lista de relaciones entre entidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EntityRelationship'
 */
router.get(
  "/relationships",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const relationships =
        await relationshipRepository.findWithEntityDetails();
      res.json(relationships);
    } catch (error) {
      console.error("Error obtaining relationships:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/relationships:
 *   post:
 *     summary: Crear una nueva relación entre entidades
 *     tags: [Entity Relationships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source_entity_id
 *               - target_entity_id
 *               - relationship_type
 *             properties:
 *               source_entity_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la entidad origen
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               target_entity_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la entidad destino
 *                 example: "987fcdeb-51a2-43f1-8765-123456789abc"
 *               relationship_type:
 *                 type: string
 *                 enum: [one_to_one, one_to_many, many_to_one, many_to_many]
 *                 description: Tipo de relación
 *                 example: "one_to_many"
 *               source_field_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del campo en la entidad origen (opcional)
 *               target_field_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del campo en la entidad destino (opcional)
 *               name:
 *                 type: string
 *                 description: Nombre de la relación
 *                 example: "author_posts"
 *               description:
 *                 type: string
 *                 description: Descripción de la relación
 *               is_required:
 *                 type: boolean
 *                 description: Si la relación es requerida
 *                 default: false
 *               cascade_delete:
 *                 type: boolean
 *                 description: Si se debe eliminar en cascada
 *                 default: false
 *     responses:
 *       201:
 *         description: Relación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityRelationship'
 *       400:
 *         description: Error en los datos enviados
 *       404:
 *         description: Entidad no encontrada
 */
router.post(
  "/relationships",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        source_entity_id,
        target_entity_id,
        relationship_type,
        source_field_id,
        target_field_id,
        name,
        description,
        is_required,
        cascade_delete,
      } = req.body;

      // Validaciones básicas
      if (!source_entity_id || !target_entity_id || !relationship_type) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "source_entity_id, target_entity_id y relationship_type son requeridos",
        });
        return;
      }

      // Validar que el tipo de relación sea válido
      const validTypes: RelationshipType[] = [
        "one_to_one",
        "one_to_many",
        "many_to_one",
        "many_to_many",
      ];
      if (!validTypes.includes(relationship_type)) {
        res.status(400).json({
          error: "Bad Request",
          message:
            "relationship_type debe ser uno de: " + validTypes.join(", "),
        });
        return;
      }

      // Verificar que las entidades existen
      const sourceEntityExists = await entityRepository.exists(
        source_entity_id
      );
      if (!sourceEntityExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad origen no encontrada",
        });
        return;
      }

      const targetEntityExists = await entityRepository.exists(
        target_entity_id
      );
      if (!targetEntityExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad destino no encontrada",
        });
        return;
      }

      // Verificar que los campos existen si se proporcionan
      if (source_field_id) {
        const sourceFieldExists = await fieldRepository.exists(source_field_id);
        if (!sourceFieldExists) {
          res.status(404).json({
            error: "Not Found",
            message: "Campo origen no encontrado",
          });
          return;
        }

        // Verificar que el campo pertenece a la entidad origen
        const fieldBelongsToSourceEntity =
          await fieldRepository.belongsToEntity(
            source_field_id,
            source_entity_id
          );
        if (!fieldBelongsToSourceEntity) {
          res.status(400).json({
            error: "Bad Request",
            message: "El campo origen no pertenece a la entidad origen",
          });
          return;
        }
      }

      if (target_field_id) {
        const targetFieldExists = await fieldRepository.exists(target_field_id);
        if (!targetFieldExists) {
          res.status(404).json({
            error: "Not Found",
            message: "Campo destino no encontrado",
          });
          return;
        }

        // Verificar que el campo pertenece a la entidad destino
        const fieldBelongsToTargetEntity =
          await fieldRepository.belongsToEntity(
            target_field_id,
            target_entity_id
          );
        if (!fieldBelongsToTargetEntity) {
          res.status(400).json({
            error: "Bad Request",
            message: "El campo destino no pertenece a la entidad destino",
          });
          return;
        }
      }

      // Crear relación en base de datos
      const relationshipId = generateUUID();
      const relationship = await relationshipRepository.create(relationshipId, {
        source_entity_id,
        target_entity_id,
        relationship_type,
        source_field_id: source_field_id || undefined,
        target_field_id: target_field_id || undefined,
        name: name || undefined,
        description: description || undefined,
        is_required: is_required || false,
        cascade_delete: cascade_delete || false,
      });

      res.status(201).json(relationship);
    } catch (error) {
      console.error("Error creating relationship:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/relationships/{id}:
 *   get:
 *     summary: Obtener una relación específica por ID
 *     tags: [Entity Relationships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la relación
 *     responses:
 *       200:
 *         description: Relación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EntityRelationship'
 *       404:
 *         description: Relación no encontrada
 */
router.get(
  "/relationships/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const relationship = await relationshipRepository.findById(id);
      if (!relationship) {
        res.status(404).json({
          error: "Not Found",
          message: "Relación no encontrada",
        });
        return;
      }

      res.json(relationship);
    } catch (error) {
      console.error("Error obtaining relationship:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/relationships/{id}:
 *   put:
 *     summary: Actualizar una relación existente
 *     tags: [Entity Relationships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la relación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               relationship_type:
 *                 type: string
 *                 enum: [one_to_one, one_to_many, many_to_one, many_to_many]
 *               source_field_id:
 *                 type: string
 *                 format: uuid
 *               target_field_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               is_required:
 *                 type: boolean
 *               cascade_delete:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Relación actualizada exitosamente
 *       404:
 *         description: Relación no encontrada
 */
router.put(
  "/relationships/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        relationship_type,
        source_field_id,
        target_field_id,
        name,
        description,
        is_required,
        cascade_delete,
      } = req.body;

      // Verificar que la relación existe
      const existingRelationship = await relationshipRepository.findById(id);
      if (!existingRelationship) {
        res.status(404).json({
          error: "Not Found",
          message: "Relación no encontrada",
        });
        return;
      }

      // Validar tipo de relación si se proporciona
      if (relationship_type) {
        const validTypes: RelationshipType[] = [
          "one_to_one",
          "one_to_many",
          "many_to_one",
          "many_to_many",
        ];
        if (!validTypes.includes(relationship_type)) {
          res.status(400).json({
            error: "Bad Request",
            message:
              "relationship_type debe ser uno de: " + validTypes.join(", "),
          });
          return;
        }
      }

      // Validar campos si se proporcionan
      if (source_field_id) {
        const sourceFieldExists = await fieldRepository.exists(source_field_id);
        if (!sourceFieldExists) {
          res.status(404).json({
            error: "Not Found",
            message: "Campo origen no encontrado",
          });
          return;
        }

        const fieldBelongsToSourceEntity =
          await fieldRepository.belongsToEntity(
            source_field_id,
            existingRelationship.source_entity_id
          );
        if (!fieldBelongsToSourceEntity) {
          res.status(400).json({
            error: "Bad Request",
            message: "El campo origen no pertenece a la entidad origen",
          });
          return;
        }
      }

      if (target_field_id) {
        const targetFieldExists = await fieldRepository.exists(target_field_id);
        if (!targetFieldExists) {
          res.status(404).json({
            error: "Not Found",
            message: "Campo destino no encontrado",
          });
          return;
        }

        const fieldBelongsToTargetEntity =
          await fieldRepository.belongsToEntity(
            target_field_id,
            existingRelationship.target_entity_id
          );
        if (!fieldBelongsToTargetEntity) {
          res.status(400).json({
            error: "Bad Request",
            message: "El campo destino no pertenece a la entidad destino",
          });
          return;
        }
      }

      // Actualizar relación
      const updatedRelationship = await relationshipRepository.update(id, {
        relationship_type,
        source_field_id,
        target_field_id,
        name,
        description,
        is_required,
        cascade_delete,
      });

      res.json(updatedRelationship);
    } catch (error) {
      console.error("Error updating relationship:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/relationships/{id}:
 *   delete:
 *     summary: Eliminar una relación
 *     tags: [Entity Relationships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la relación
 *     responses:
 *       204:
 *         description: Relación eliminada exitosamente
 *       404:
 *         description: Relación no encontrada
 */
router.delete(
  "/relationships/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const deleted = await relationshipRepository.delete(id);
      if (!deleted) {
        res.status(404).json({
          error: "Not Found",
          message: "Relación no encontrada",
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting relationship:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/entities/{entityId}/relationships:
 *   get:
 *     summary: Obtener todas las relaciones de una entidad específica
 *     tags: [Entity Relationships]
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
 *         description: Lista de relaciones de la entidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EntityRelationship'
 *       404:
 *         description: Entidad no encontrada
 */
router.get(
  "/entities/:entityId/relationships",
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

      const relationships = await relationshipRepository.findByEntityId(
        entityId
      );
      res.json(relationships);
    } catch (error) {
      console.error("Error obtaining entity relationships:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

export default router;
