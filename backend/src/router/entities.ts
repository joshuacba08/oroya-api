import { Request, Response, Router } from "express";
import { EntityRepository } from "../repositories/entityRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { generateUUID } from "../utils/uuid";

const router = Router();
const entityRepository = new EntityRepository();
const projectRepository = new ProjectRepository();

/**
 * @swagger
 * /api/projects/{projectId}/entities:
 *   get:
 *     summary: Obtener todas las entidades de un proyecto
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Lista de entidades del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Entity'
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/projects/:projectId/entities",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      // Verificar que el proyecto existe
      const projectExists = await projectRepository.exists(projectId);
      if (!projectExists) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      // Obtener entidades del proyecto
      const entities = await entityRepository.findByProjectId(projectId);
      res.json(entities);
    } catch (error) {
      console.error("Error obtaining project entities:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/entities:
 *   post:
 *     summary: Crear una nueva entidad en un proyecto específico
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto al que pertenece la entidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la entidad
 *                 example: "Product"
 *               description:
 *                 type: string
 *                 description: Descripción de la entidad
 *                 example: "Producto de ecommerce"
 *     responses:
 *       201:
 *         description: Entidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entity'
 *       400:
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/projects/:projectId/entities",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { name, description } = req.body;

      if (!name) {
        res.status(400).json({
          error: "Bad Request",
          message: "El nombre de la entidad es requerido",
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

      // Crear entidad en base de datos
      const entityId = generateUUID();
      const entity = await entityRepository.create(entityId, {
        project_id: projectId,
        name,
        description: description || undefined,
      });

      res.status(201).json(entity);
    } catch (error) {
      console.error("Error creating entity:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/entities:
 *   post:
 *     summary: Crear una nueva entidad
 *     tags: [Entities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - name
 *             properties:
 *               projectId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del proyecto al que pertenece
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               name:
 *                 type: string
 *                 description: Nombre de la entidad
 *                 example: "User"
 *               description:
 *                 type: string
 *                 description: Descripción de la entidad
 *                 example: "Entidad para gestionar usuarios del sistema"
 *     responses:
 *       201:
 *         description: Entidad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entity'
 *       400:
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, name, description } = req.body;

    if (!projectId || !name) {
      res.status(400).json({
        error: "Bad Request",
        message: "El projectId y name son requeridos",
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

    // Crear entidad en base de datos
    const entityId = generateUUID();
    const entity = await entityRepository.create(entityId, {
      project_id: projectId,
      name,
      description: description || undefined,
    });

    res.status(201).json(entity);
  } catch (error) {
    console.error("Error creating entity:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Error interno del servidor",
    });
  }
});

/**
 * @swagger
 * /api/entities/{entityId}:
 *   get:
 *     summary: Obtener una entidad específica
 *     tags: [Entities]
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
 *         description: Entidad encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entity'
 *       404:
 *         description: Entidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:entityId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityId } = req.params;

    // Obtener entidad específica
    const entity = await entityRepository.findById(entityId);

    if (!entity) {
      res.status(404).json({
        error: "Not Found",
        message: "Entidad no encontrada",
      });
      return;
    }

    res.json(entity);
  } catch (error) {
    console.error("Error obtaining entity:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Error interno del servidor",
    });
  }
});

/**
 * @swagger
 * /api/entities/{entityId}:
 *   put:
 *     summary: Actualizar una entidad completa
 *     tags: [Entities]
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la entidad
 *                 example: "User Updated"
 *               description:
 *                 type: string
 *                 description: Descripción de la entidad
 *                 example: "Entidad actualizada para gestionar usuarios"
 *     responses:
 *       200:
 *         description: Entidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entity'
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
router.put("/:entityId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        error: "Bad Request",
        message: "El nombre de la entidad es requerido",
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

    // Actualizar entidad en base de datos
    const updatedEntity = await entityRepository.update(entityId, {
      name,
      description: description || undefined,
    });

    if (!updatedEntity) {
      res.status(404).json({
        error: "Not Found",
        message: "Entidad no encontrada",
      });
      return;
    }

    res.json(updatedEntity);
  } catch (error) {
    console.error("Error updating entity:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Error interno del servidor",
    });
  }
});

/**
 * @swagger
 * /api/entities/{entityId}:
 *   patch:
 *     summary: Actualizar parcialmente una entidad
 *     tags: [Entities]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la entidad
 *                 example: "User Updated"
 *               description:
 *                 type: string
 *                 description: Descripción de la entidad
 *                 example: "Entidad actualizada para gestionar usuarios"
 *     responses:
 *       200:
 *         description: Entidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entity'
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
router.patch(
  "/:entityId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityId } = req.params;
      const { name, description } = req.body;

      // Verificar que al menos un campo está presente
      if (name === undefined && description === undefined) {
        res.status(400).json({
          error: "Bad Request",
          message: "Debe proporcionar al menos un campo para actualizar",
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

      // Actualizar entidad en base de datos
      const updatedEntity = await entityRepository.update(entityId, {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
      });

      if (!updatedEntity) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada",
        });
        return;
      }

      res.json(updatedEntity);
    } catch (error) {
      console.error("Error updating entity:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/entities/{entityId}:
 *   delete:
 *     summary: Eliminar una entidad
 *     tags: [Entities]
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
 *         description: Entidad eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Entidad eliminada exitosamente"
 *       404:
 *         description: Entidad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:entityId",
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

      // Eliminar entidad de la base de datos
      const deleted = await entityRepository.delete(entityId);

      if (!deleted) {
        res.status(404).json({
          error: "Not Found",
          message: "Entidad no encontrada",
        });
        return;
      }

      res.json({
        success: true,
        message: "Entidad eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error deleting entity:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

// UUID generation is now handled by the imported utility

export default router;
