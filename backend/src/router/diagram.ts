import { Request, Response, Router } from "express";
import { DiagramRepository } from "../repositories/diagramRepository";
import { ProjectRepository } from "../repositories/projectRepository";

const router = Router();
const diagramRepository = new DiagramRepository();
const projectRepository = new ProjectRepository();

/**
 * @swagger
 * /api/projects/{projectId}/diagram:
 *   get:
 *     summary: Obtiene el diagrama UML de un proyecto
 *     description: Genera y devuelve la estructura JSON compatible con React Flow para representar el diagrama UML de las entidades y relaciones de un proyecto
 *     tags: [Diagrams]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Diagrama UML generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     nodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                           position:
 *                             type: object
 *                             properties:
 *                               x:
 *                                 type: number
 *                               y:
 *                                 type: number
 *                           data:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                               entity:
 *                                 type: object
 *                               fields:
 *                                 type: array
 *                     edges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           source:
 *                             type: string
 *                           target:
 *                             type: string
 *                           type:
 *                             type: string
 *                           label:
 *                             type: string
 *                     viewport:
 *                       type: object
 *                       properties:
 *                         x:
 *                           type: number
 *                         y:
 *                           type: number
 *                         zoom:
 *                           type: number
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/projects/:projectId/diagram",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      // Verificar que el proyecto existe
      const project = await projectRepository.findById(projectId);
      if (!project) {
        res.status(404).json({
          error: "Proyecto no encontrado",
          message: `No se encontró un proyecto con el ID: ${projectId}`,
        });
        return;
      }

      // Generar el diagrama UML
      const diagramData = await diagramRepository.generateUMLDiagram(projectId);

      res.json({
        message: "Diagrama UML generado exitosamente",
        data: diagramData,
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
        },
      });
    } catch (error) {
      console.error("Error generando diagrama UML:", error);
      res.status(500).json({
        error: "Error generando diagrama UML",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/diagram/relationships:
 *   get:
 *     summary: Obtiene las relaciones entre entidades de un proyecto
 *     description: Devuelve información detallada sobre las relaciones entre entidades del proyecto
 *     tags: [Diagrams]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Relaciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       source_entity:
 *                         type: string
 *                       target_entity:
 *                         type: string
 *                       field_name:
 *                         type: string
 *                       relationship_type:
 *                         type: string
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/projects/:projectId/diagram/relationships",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      // Verificar que el proyecto existe
      const project = await projectRepository.findById(projectId);
      if (!project) {
        res.status(404).json({
          error: "Proyecto no encontrado",
          message: `No se encontró un proyecto con el ID: ${projectId}`,
        });
        return;
      }

      // Obtener las relaciones
      const relationships = await diagramRepository.getEntityRelationships(
        projectId
      );

      res.json({
        message: "Relaciones obtenidas exitosamente",
        data: relationships,
      });
    } catch (error) {
      console.error("Error obteniendo relaciones:", error);
      res.status(500).json({
        error: "Error obteniendo relaciones",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
);

/**
 * @swagger
 * /api/projects/{projectId}/diagram/stats:
 *   get:
 *     summary: Obtiene estadísticas del diagrama de un proyecto
 *     description: Devuelve estadísticas sobre entidades, campos y relaciones del proyecto
 *     tags: [Diagrams]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_entities:
 *                       type: number
 *                     total_fields:
 *                       type: number
 *                     total_relationships:
 *                       type: number
 *                     entity_types:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           count:
 *                             type: number
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/projects/:projectId/diagram/stats",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      // Verificar que el proyecto existe
      const project = await projectRepository.findById(projectId);
      if (!project) {
        res.status(404).json({
          error: "Proyecto no encontrado",
          message: `No se encontró un proyecto con el ID: ${projectId}`,
        });
        return;
      }

      // Obtener estadísticas
      const stats = await diagramRepository.getProjectStats(projectId);

      res.json({
        message: "Estadísticas obtenidas exitosamente",
        data: stats,
      });
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      res.status(500).json({
        error: "Error obteniendo estadísticas",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
);

export default router;
