import cors from "cors";
import express, { Application } from "express";
import { specs, swaggerUi } from "./config/swagger";
import apiRouter from "./router";

class Server {
  public app: Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.app.use(cors());
    this.port = port;
    this.config();
    this.routes();
  }

  private config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    // Swagger Documentation
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

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

    // Root endpoint with API information
    this.app.get("/", (req, res) => {
      res.json({
        name: "OroyaAPI Backend",
        version: "1.0.0",
        description:
          "API para gestión dinámica de proyectos, entidades y campos",
        documentation: `http://localhost:${this.port}/api-docs`,
        health: `http://localhost:${this.port}/health`,
        endpoints: {
          projects: `http://localhost:${this.port}/api/projects`,
          entities: `http://localhost:${this.port}/api/entities`,
          fields: `http://localhost:${this.port}/api/fields`,
        },
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server is running on port ${this.port}`);
      console.log(
        `📚 API Documentation: http://localhost:${this.port}/api-docs`
      );
      console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
    });
  }
}

export default Server;
