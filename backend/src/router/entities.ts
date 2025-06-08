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

// UUID generation is now handled by the imported utility

export default router;
