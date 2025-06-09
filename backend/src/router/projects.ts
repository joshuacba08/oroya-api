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

/**
 * @swagger
 * /api/projects/{projectId}:
 *   put:
 *     summary: Actualizar un proyecto completo
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto
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
 *                 example: "Mi Proyecto Actualizado"
 *               description:
 *                 type: string
 *                 description: Descripción del proyecto
 *                 example: "Descripción actualizada del proyecto"
 *     responses:
 *       200:
 *         description: Proyecto actualizado exitosamente
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
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:projectId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { name, description } = req.body;

      if (!name) {
        res.status(400).json({
          error: "Bad Request",
          message: "El nombre del proyecto es requerido",
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

      // Actualizar proyecto en base de datos
      const updatedProject = await projectRepository.update(projectId, {
        name,
        description: description || undefined,
      });

      if (!updatedProject) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   patch:
 *     summary: Actualizar parcialmente un proyecto
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del proyecto
 *                 example: "Mi Proyecto Actualizado"
 *               description:
 *                 type: string
 *                 description: Descripción del proyecto
 *                 example: "Descripción actualizada del proyecto"
 *     responses:
 *       200:
 *         description: Proyecto actualizado exitosamente
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
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  "/:projectId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;
      const { name, description } = req.body;

      // Verificar que al menos un campo está presente
      if (name === undefined && description === undefined) {
        res.status(400).json({
          error: "Bad Request",
          message: "Debe proporcionar al menos un campo para actualizar",
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

      // Actualizar proyecto en base de datos
      const updatedProject = await projectRepository.update(projectId, {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
      });

      if (!updatedProject) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   delete:
 *     summary: Eliminar un proyecto
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
 *         description: Proyecto eliminado exitosamente
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
 *                   example: "Proyecto eliminado exitosamente"
 *       404:
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  "/:projectId",
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

      // Eliminar proyecto de la base de datos
      const deleted = await projectRepository.delete(projectId);

      if (!deleted) {
        res.status(404).json({
          error: "Not Found",
          message: "Proyecto no encontrado",
        });
        return;
      }

      res.json({
        success: true,
        message: "Proyecto eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error interno del servidor",
      });
    }
  }
);

// UUID generation is now handled by the imported utility

export default router;
