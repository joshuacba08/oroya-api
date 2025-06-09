import { Request, Response, Router } from "express";
import { getDatabase } from "../config/database";
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

/**
 * @swagger
 * /api/analytics/logs:
 *   get:
 *     summary: Obtiene lista de logs con paginación y filtros
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 1000
 *         description: Número de logs por página
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filtrar por proyecto específico
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [GET, POST, PUT, DELETE, PATCH]
 *         description: Filtrar por método HTTP
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [2xx, 3xx, 4xx, 5xx]
 *         description: Filtrar por rango de código de estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en URL o error message
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio (ISO string)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin (ISO string)
 *     responses:
 *       200:
 *         description: Lista de logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                 filters:
 *                   type: object
 *       500:
 *         description: Error interno del servidor
 */
router.get("/logs", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 50,
      projectId,
      method,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    // Validar parámetros
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      1000,
      Math.max(1, parseInt(limit as string) || 50)
    );
    const offset = (pageNum - 1) * limitNum;

    // Construir consulta con filtros
    let whereConditions: string[] = [];
    let params: any[] = [];

    if (projectId) {
      whereConditions.push("project_id = ?");
      params.push(projectId);
    }

    if (method) {
      whereConditions.push("method = ?");
      params.push(method);
    }

    if (status) {
      const statusCode = status as string;
      if (statusCode === "2xx") {
        whereConditions.push("status_code >= 200 AND status_code < 300");
      } else if (statusCode === "3xx") {
        whereConditions.push("status_code >= 300 AND status_code < 400");
      } else if (statusCode === "4xx") {
        whereConditions.push("status_code >= 400 AND status_code < 500");
      } else if (statusCode === "5xx") {
        whereConditions.push("status_code >= 500 AND status_code < 600");
      }
    }

    if (search) {
      whereConditions.push("(url LIKE ? OR error_message LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (startDate) {
      whereConditions.push("timestamp >= ?");
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push("timestamp <= ?");
      params.push(endDate);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    const db = getDatabase();

    // Contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM api_logs ${whereClause}`;
    const countStmt = db.prepare(countQuery);
    const countResult = countStmt.get(...params) as { total: number };
    const total = countResult.total;

    // Obtener logs con paginación
    const logsQuery = `
      SELECT 
        id,
        timestamp,
        method,
        url,
        status_code,
        response_time,
        ip_address,
        user_agent,
        browser,
        os,
        device,
        project_id,
        entity_type,
        entity_id,
        user_id,
        request_size,
        response_size,
        error_message,
        query_params,
        headers,
        referrer
      FROM api_logs 
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const logsStmt = db.prepare(logsQuery);
    const logs = logsStmt.all(...params, limitNum, offset);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);

    logger.info("📋 Logs requested", {
      page: pageNum,
      limit: limitNum,
      total,
      filters: { projectId, method, status, search },
      ip: req.ip,
    });

    const response = {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      filters: {
        projectId: projectId || null,
        method: method || null,
        status: status || null,
        search: search || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        timezone: "UTC",
      },
    };

    res.json(response);
  } catch (error) {
    logger.error("❌ Error getting logs:", error);
    res.status(500).json({
      error: "Error retrieving logs",
      message:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : "Internal server error",
    });
  }
});

export default router;
