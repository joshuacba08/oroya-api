import { NextFunction, Request, Response } from "express";
import requestIp from "request-ip";
import useragent from "useragent";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database";
import logger from "../config/logger";

// Interfaz para datos del log
interface LogData {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status_code?: number;
  response_time?: number;
  ip_address: string;
  user_agent: string;
  browser?: string;
  os?: string;
  device?: string;
  project_id?: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  request_size?: number;
  response_size?: number;
  error_message?: string;
  query_params?: string;
  body_params?: string;
  headers?: string;
  referrer?: string;
  session_id?: string;
}

// Extender el objeto Request para incluir datos del log
declare global {
  namespace Express {
    interface Request {
      logData?: Partial<LogData>;
      startTime?: number;
    }
  }
}

// Middleware para inicializar el logging
export const initializeLogging = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const logId = uuidv4();

  // Obtener información del request
  const clientIp = requestIp.getClientIp(req) || "unknown";
  const userAgentString = req.get("User-Agent") || "unknown";
  const agent = useragent.parse(userAgentString);

  // Datos iniciales del log
  req.logData = {
    id: logId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl || req.url,
    ip_address: clientIp,
    user_agent: userAgentString,
    browser: `${agent.family} ${agent.major}`,
    os: `${agent.os.family} ${agent.os.major}`,
    device: agent.device.family,
    query_params: JSON.stringify(req.query),
    headers: JSON.stringify({
      "content-type": req.get("Content-Type"),
      accept: req.get("Accept"),
      authorization: req.get("Authorization") ? "[HIDDEN]" : undefined,
      "x-forwarded-for": req.get("X-Forwarded-For"),
      "x-real-ip": req.get("X-Real-IP"),
    }),
    referrer: req.get("Referer"),
    request_size: JSON.stringify(req.body || {}).length,
  };

  req.startTime = startTime;

  // Log del inicio del request
  logger.info("📥 Incoming request", {
    id: logId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: clientIp,
    userAgent: `${agent.family} ${agent.major} on ${agent.os.family}`,
  });

  next();
};

// Middleware para finalizar el logging
export const finalizeLogging = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;
  const originalJson = res.json;

  // Interceptar response para obtener el tamaño
  res.send = function (body: any) {
    if (req.logData) {
      req.logData.response_size =
        typeof body === "string" ? body.length : JSON.stringify(body).length;
    }
    return originalSend.call(this, body);
  };

  res.json = function (body: any) {
    if (req.logData) {
      req.logData.response_size = JSON.stringify(body).length;
    }
    return originalJson.call(this, body);
  };

  // Evento cuando el response termina
  res.on("finish", async () => {
    if (req.logData && req.startTime) {
      const responseTime = Date.now() - req.startTime;

      // Completar datos del log
      req.logData.status_code = res.statusCode;
      req.logData.response_time = responseTime;

      // Extraer project_id de la URL si existe
      const projectMatch = req.originalUrl?.match(/\/api\/projects\/([^\/]+)/);
      if (projectMatch) {
        req.logData.project_id = projectMatch[1];
      }

      // Extraer entity info de la URL
      const entityMatch = req.originalUrl?.match(/\/api\/entities\/([^\/]+)/);
      if (entityMatch) {
        req.logData.entity_type = "entity";
        req.logData.entity_id = entityMatch[1];
      }

      // Log del final del request
      const logLevel =
        res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
          ? "warn"
          : "info";

      logger[logLevel]("📤 Request completed", {
        id: req.logData.id,
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.logData.ip_address,
      });

      // Guardar en base de datos
      try {
        await saveLogToDatabase(req.logData as LogData);
      } catch (error) {
        logger.error("❌ Error saving log to database:", error);
      }
    }
  });

  next();
};

// Función para guardar el log en la base de datos
async function saveLogToDatabase(logData: LogData): Promise<void> {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO api_logs (
        id, timestamp, method, url, status_code, response_time,
        ip_address, user_agent, browser, os, device, project_id,
        entity_type, entity_id, user_id, request_size, response_size,
        error_message, query_params, body_params, headers, referrer, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      logData.id,
      logData.timestamp,
      logData.method,
      logData.url,
      logData.status_code || null,
      logData.response_time || null,
      logData.ip_address,
      logData.user_agent,
      logData.browser || null,
      logData.os || null,
      logData.device || null,
      logData.project_id || null,
      logData.entity_type || null,
      logData.entity_id || null,
      logData.user_id || null,
      logData.request_size || null,
      logData.response_size || null,
      logData.error_message || null,
      logData.query_params || null,
      logData.body_params || null,
      logData.headers || null,
      logData.referrer || null,
      logData.session_id || null
    );
  } catch (error) {
    throw error;
  }
}

// Middleware para capturar errores
export const errorLogging = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorId = uuidv4();

  // Log del error
  logger.error("💥 Unhandled error", {
    id: errorId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: requestIp.getClientIp(req),
  });

  // Actualizar log data si existe
  if (req.logData) {
    req.logData.error_message = err.message;
  }

  // Respuesta de error
  res.status(500).json({
    error: "Internal Server Error",
    errorId,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

// Función para obtener estadísticas de uso
export async function getApiStats(
  projectId?: string,
  timeRange?: string
): Promise<any> {
  try {
    const db = getDatabase();
    let whereClause = "";
    const params: any[] = [];

    if (projectId) {
      whereClause += " WHERE project_id = ?";
      params.push(projectId);
    }

    if (timeRange) {
      const timeCondition = projectId ? " AND " : " WHERE ";
      whereClause += `${timeCondition} timestamp >= datetime('now', '-${timeRange}')`;
    }

    const queries = {
      totalRequests: `SELECT COUNT(*) as total FROM api_logs${whereClause}`,
      requestsByMethod: `SELECT method, COUNT(*) as count FROM api_logs${whereClause} GROUP BY method`,
      requestsByStatus: `SELECT status_code, COUNT(*) as count FROM api_logs${whereClause} GROUP BY status_code`,
      avgResponseTime: `SELECT AVG(response_time) as avg_time FROM api_logs${whereClause}`,
      topEndpoints: `SELECT url, COUNT(*) as count FROM api_logs${whereClause} GROUP BY url ORDER BY count DESC LIMIT 10`,
      errorRate: `SELECT 
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as errors,
        COUNT(*) as total,
        ROUND((COUNT(CASE WHEN status_code >= 400 THEN 1 END) * 100.0 / COUNT(*)), 2) as error_rate
        FROM api_logs${whereClause}`,
      hourlyTraffic: `SELECT 
        strftime('%H', timestamp) as hour,
        COUNT(*) as requests
        FROM api_logs${whereClause}
        GROUP BY strftime('%H', timestamp)
        ORDER BY hour`,
      topIPs: `SELECT ip_address, COUNT(*) as requests FROM api_logs${whereClause} GROUP BY ip_address ORDER BY requests DESC LIMIT 10`,
      browserStats: `SELECT browser, COUNT(*) as count FROM api_logs${whereClause} WHERE browser IS NOT NULL GROUP BY browser ORDER BY count DESC LIMIT 10`,
    };

    const results: any = {};

    for (const [key, query] of Object.entries(queries)) {
      try {
        if (
          key === "totalRequests" ||
          key === "avgResponseTime" ||
          key === "errorRate"
        ) {
          const stmt = db.prepare(query);
          results[key] = stmt.get(...params);
        } else {
          const stmt = db.prepare(query);
          results[key] = stmt.all(...params);
        }
      } catch (error) {
        logger.error(`Error executing query ${key}:`, error);
        results[key] = null;
      }
    }

    return results;
  } catch (error) {
    logger.error("Error getting API stats:", error);
    throw error;
  }
}
