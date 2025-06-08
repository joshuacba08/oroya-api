import { Request, Response, Router } from "express";
import { ProjectRepository } from "../repositories/projectRepository";
import { generateUUID } from "../utils/uuid";

const router = Router();
const projectRepository = new ProjectRepository();

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Projects]
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
 *                 description: Nombre del proyecto
 *                 example: "Mi Proyecto API"
 *               description:
 *                 type: string
 *                 description: Descripción opcional del proyecto
 *                 example: "Proyecto para gestionar usuarios y productos"
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Error en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        error: "Bad Request",
        message: "El nombre del proyecto es requerido",
      });
      return;
    }

    // Crear proyecto en base de datos
    const projectId = generateUUID();
    const project = await projectRepository.create(projectId, {
      name,
      description: description || undefined,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Error interno del servidor",
    });
  }
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Obtener todos los proyectos
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener todos los proyectos de la base de datos
    const projects = await projectRepository.findAll();
    res.json(projects);
  } catch (error) {
    console.error("Error obtaining projects:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Error interno del servidor",
    });
  }
});

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Obtener un proyecto específico
 *     tags: [Projects]
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
 *         description: Proyecto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:projectId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      // Obtener proyecto específico
      const project = await projectRepository.findById(projectId);

      if (!project) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      res.json(project);
    } catch (error) {
      console.error("Error obtaining project:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

// UUID generation is now handled by the imported utility

export default router;
