import { Router } from "express";
import { getDatabaseInfo } from "../config/database";
import entitiesRouter from "./entities";
import fieldsRouter from "./fields";
import filesRouter from "./files";
import projectsRouter from "./projects";

const router = Router();

// Debug endpoint para verificar configuración de base de datos
router.get("/debug/database", (req, res) => {
  try {
    const dbInfo = getDatabaseInfo();
    res.json({
      message: "Database configuration info",
      ...dbInfo,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error getting database info",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Configurar rutas para proyectos
router.use("/projects", projectsRouter);

// Configurar rutas para archivos (debe ir antes que las rutas genéricas)
router.use("/files", filesRouter);

// Configurar rutas para entidades
router.use("/entities", entitiesRouter);

// Configurar rutas para campos
router.use("/fields", fieldsRouter);

// Configurar rutas genéricas (deben ir al final)
router.use("/", entitiesRouter); // Para rutas como /projects/:projectId/entities
router.use("/", fieldsRouter); // Para rutas como /entities/:entityId/fields

export default router;
