import fs from "fs";
import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configuración de colores personalizados
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  debug: "green",
});

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Formato para archivos (sin colores)
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.json()
);

// Transportes
const transports = [
  // Console
  new winston.transports.Console({
    format: logFormat,
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),

  // Archivo para errores
  new DailyRotateFile({
    filename: path.join(logsDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    format: fileLogFormat,
    maxSize: "20m",
    maxFiles: "14d",
    handleExceptions: true,
    handleRejections: true,
  }),

  // Archivo para todos los logs
  new DailyRotateFile({
    filename: path.join(logsDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    format: fileLogFormat,
    maxSize: "20m",
    maxFiles: "30d",
  }),

  // Archivo para logs HTTP
  new DailyRotateFile({
    filename: path.join(logsDir, "http-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "http",
    format: fileLogFormat,
    maxSize: "20m",
    maxFiles: "30d",
  }),
];

// Crear el logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: fileLogFormat,
  transports,
  exitOnError: false,
});

// Stream para Morgan
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export { logger, stream };
export default logger;
