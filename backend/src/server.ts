import cors from "cors";
import express, { Application } from "express";
import { createServer, Server as HttpServer } from "http";
import morgan from "morgan";
import { closeDatabase, createTables, initDatabase } from "./config/database";
import logger, { stream } from "./config/logger";
import { initializeSocket } from "./config/socket";
import { specs, swaggerUi } from "./config/swagger";
import {
  errorLogging,
  finalizeLogging,
  initializeLogging,
} from "./middleware/logging";
import apiRouter from "./router";
import analyticsRouter from "./router/analytics";
import { checkMigrationsNeeded, runMigrations } from "./utils/migration";

class Server {
  public app: Application;
  private port: number;
  private httpServer: HttpServer;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.httpServer = createServer(this.app);
    this.config();
    this.routes();
    this.initializeSocket();
  }

  private config(): void {
    // CORS - Configuración más permisiva para desarrollo local
    this.app.use(
      cors({
        origin:
          process.env.NODE_ENV === "development"
            ? true
            : ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true,
      })
    );

    // Logging middleware - debe ir antes de otros middlewares
    this.app.use(initializeLogging);
    this.app.use(finalizeLogging);

    // Morgan para logging HTTP
    this.app.use(morgan("combined", { stream }));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    // Swagger Documentation
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

    // Analytics Routes (nuevo)
    this.app.use("/api/analytics", analyticsRouter);

    // API Routes
    this.app.use("/api", apiRouter);

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        message: "OroyaAPI Backend is running",
        timestamp: new Date().toISOString(),
      });
    });

    // CORS test endpoint
    this.app.get("/cors-test", (req, res) => {
      res.status(200).json({
        message: "CORS is working!",
        origin: req.headers.origin,
        timestamp: new Date().toISOString(),
      });
    });

    // Root endpoint with API information
    this.app.get("/", (req, res) => {
      res.json({
        name: "OroyaAPI Backend",
        version: "1.0.0",
        description:
          "API para gestión dinámica de proyectos, entidades y campos",
        documentation: `http://localhost:${this.port}/api-docs`,
        health: `http://localhost:${this.port}/health`,
        analytics: `http://localhost:${this.port}/api/analytics/stats`,
        realTimeLogs: `ws://localhost:${this.port}`, // Socket.io endpoint
        endpoints: {
          projects: `http://localhost:${this.port}/api/projects`,
          entities: `http://localhost:${this.port}/api/entities`,
          fields: `http://localhost:${this.port}/api/fields`,
          relationships: `http://localhost:${this.port}/api/relationships`,
          analytics: `http://localhost:${this.port}/api/analytics`,
          logs: `http://localhost:${this.port}/api/analytics/logs`,
        },
      });
    });

    // Error handling middleware - debe ir al final
    this.app.use(errorLogging);
  }

  private initializeSocket(): void {
    try {
      initializeSocket(this.httpServer);
      logger.info("✅ Socket.io initialized for real-time logs");
    } catch (error) {
      logger.error("❌ Error initializing Socket.io:", error);
    }
  }

  public async start(): Promise<void> {
    try {
      // Inicializar base de datos
      logger.info("🔄 Inicializando base de datos SQLite...");
      await initDatabase();

      // Crear tablas
      logger.info("🔄 Creando tablas...");
      await createTables();

      // Ejecutar migraciones si son necesarias
      if (checkMigrationsNeeded()) {
        logger.info("🔄 Ejecutando migraciones de base de datos...");
        await runMigrations();
      } else {
        logger.info(
          "✅ Base de datos actualizada, no se requieren migraciones"
        );
      }

      logger.info("✅ Base de datos inicializada correctamente");

      this.httpServer.listen(this.port, () => {
        logger.info(`🚀 Server is running on port ${this.port}`);
        logger.info(
          `📚 API Documentation: http://localhost:${this.port}/api-docs`
        );
        logger.info(`🏥 Health Check: http://localhost:${this.port}/health`);
        logger.info(
          `📊 Analytics: http://localhost:${this.port}/api/analytics/stats`
        );
        logger.info(
          `📋 Logs API: http://localhost:${this.port}/api/analytics/logs`
        );
        logger.info(
          `🔗 Relationships API: http://localhost:${this.port}/api/relationships`
        );
        logger.info(
          `⚡ Real-time Logs: ws://localhost:${this.port} (Socket.io)`
        );
        logger.info(
          "🎯 Sistema de logging activado - Los logs se guardan en archivos, base de datos y se transmiten en tiempo real"
        );
      });
    } catch (error) {
      logger.error("❌ Error inicializando la aplicación:", error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    try {
      logger.info("🔄 Cerrando servidor HTTP y Socket.io...");
      this.httpServer.close();

      logger.info("🔄 Cerrando conexión a la base de datos...");
      await closeDatabase();
      logger.info("✅ Servidor cerrado correctamente");
    } catch (error) {
      logger.error("❌ Error cerrando el servidor:", error);
    }
  }
}

// Manejo de señales de terminación
process.on("SIGINT", async () => {
  logger.info("\n🔄 Recibida señal SIGINT, cerrando servidor...");
  // Aquí podrías llamar a server.stop() si tuvieras una referencia al servidor
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("\n🔄 Recibida señal SIGTERM, cerrando servidor...");
  // Aquí podrías llamar a server.stop() si tuvieras una referencia al servidor
  process.exit(0);
});

export default Server;
