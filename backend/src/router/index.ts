import { Router } from "express";
import entitiesRouter from "./entities";
import fieldsRouter from "./fields";
import projectsRouter from "./projects";

const router = Router();

// Configurar rutas para proyectos
router.use("/projects", projectsRouter);

// Configurar rutas para entidades
router.use("/", entitiesRouter); // Para rutas como /projects/:projectId/entities
router.use("/entities", entitiesRouter);

// Configurar rutas para campos
router.use("/", fieldsRouter); // Para rutas como /entities/:entityId/fields
router.use("/fields", fieldsRouter);

export default router;
