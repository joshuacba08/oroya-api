import { Request, Response, Router } from "express";
import logger from "../config/logger";
import { getApiStats } from "../middleware/logging";

const router = Router();

/**
 * @swagger
 * /api/analytics/stats:
 *   get:
 *     summary: Obtiene estadísticas generales de uso de la API
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [1 hour, 24 hours, 7 days, 30 days]
 *         description: Rango de tiempo para las estadísticas
 *         example: "24 hours"
 *     responses:
 *       200:
 *         description: Estadísticas de uso de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                 requestsByMethod:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       method:
 *                         type: string
 *                       count:
 *                         type: number
 *                 requestsByStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status_code:
 *                         type: number
 *                       count:
 *                         type: number
 *                 avgResponseTime:
 *                   type: object
 *                   properties:
 *                     avg_time:
 *                       type: number
 *                 topEndpoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                       count:
 *                         type: number
 *                 errorRate:
 *                   type: object
 *                   properties:
 *                     errors:
 *                       type: number
 *                     total:
 *                       type: number
 *                     error_rate:
 *                       type: number
 *                 hourlyTraffic:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hour:
 *                         type: string
 *                       requests:
 *                         type: number
 *                 topIPs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ip_address:
 *                         type: string
 *                       requests:
 *                         type: number
 *                 browserStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       browser:
 *                         type: string
 *                       count:
 *                         type: number
 *       500:
 *         description: Error interno del servidor
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { timeRange } = req.query;

    logger.info("📊 Getting API statistics", {
      timeRange: timeRange as string,
      ip: req.ip,
    });

    const stats = await getApiStats(undefined, timeRange as string);

    // Agregar metadatos
    const response = {
      ...stats,
      metadata: {
        generatedAt: new Date().toISOString(),
        timeRange: timeRange || "all_time",
        timezone: "UTC",
      },
    };

    res.json(response);
  } catch (error) {
    logger.error("❌ Error getting API statistics:", error);
    res.status(500).json({
      error: "Error retrieving API statistics",
      message:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : "Internal server error",
    });
  }
});

/**
 * @swagger
 * /api/analytics/projects/{projectId}/stats:
 *   get:
 *     summary: Obtiene estadísticas de uso para un proyecto específico
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [1 hour, 24 hours, 7 days, 30 days]
 *         description: Rango de tiempo para las estadísticas
 *         example: "24 hours"
 *     responses:
 *       200:
 *         description: Estadísticas de uso del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectId:
 *                   type: string
 *                 totalRequests:
 *                   type: object
 *                 requestsByMethod:
 *                   type: array
 *                 requestsByStatus:
 *                   type: array
 *                 avgResponseTime:
 *                   type: object
 *                 topEndpoints:
 *                   type: array
 *                 errorRate:
 *                   type: object
 *                 hourlyTraffic:
 *                   type: array
 *                 topIPs:
 *                   type: array
 *                 browserStats:
 *                   type: array
 *                 metadata:
 *                   type: object
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
const getProjectStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { timeRange } = req.query;

    logger.info("📊 Getting project statistics", {
      projectId,
      timeRange: timeRange as string,
      ip: req.ip,
    });

    const stats = await getApiStats(projectId, timeRange as string);

    // Verificar si el proyecto tiene datos
    if (stats.totalRequests && stats.totalRequests.total === 0) {
      logger.warn("⚠️ No data found for project", { projectId });
      res.status(404).json({
        error: "No data found",
        message: `No API usage data found for project ${projectId}`,
        projectId,
      });
      return;
    }

    // Agregar metadatos específicos del proyecto
    const response = {
      projectId,
      ...stats,
      metadata: {
        generatedAt: new Date().toISOString(),
        timeRange: timeRange || "all_time",
        timezone: "UTC",
        projectId,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error("❌ Error getting project statistics:", error);
    res.status(500).json({
      error: "Error retrieving project statistics",
      message:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : "Internal server error",
    });
  }
};

router.get("/projects/:projectId/stats", getProjectStats);

/**
 * @swagger
 * /api/analytics/health:
 *   get:
 *     summary: Obtiene métricas de salud del sistema de logging
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Métricas de salud del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 uptime:
 *                   type: number
 *                 memoryUsage:
 *                   type: object
 *                 logStats:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    // Obtener estadísticas básicas de logs (última hora)
    const recentStats = await getApiStats(undefined, "1 hour");

    const healthData = {
      status: "healthy",
      uptime: Math.floor(uptime),
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      logStats: {
        recentRequests: recentStats.totalRequests?.total || 0,
        recentErrors: recentStats.errorRate?.errors || 0,
        avgResponseTime: recentStats.avgResponseTime?.avg_time || 0,
      },
      timestamp: new Date().toISOString(),
    };

    logger.info("🏥 Health check requested", {
      status: healthData.status,
      uptime: healthData.uptime,
      recentRequests: healthData.logStats.recentRequests,
    });

    res.json(healthData);
  } catch (error) {
    logger.error("❌ Error getting health metrics:", error);
    res.status(500).json({
      status: "unhealthy",
      error: "Error retrieving health metrics",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
