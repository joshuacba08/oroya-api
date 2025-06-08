import { DatabaseSync } from "node:sqlite";
import { getDatabase } from "../config/database";

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export class ProjectRepository {
  private getDb(): DatabaseSync {
    return getDatabase();
  }

  /**
   * Crear un nuevo proyecto
   */
  create(id: string, data: CreateProjectData): Promise<Project> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          INSERT INTO projects (id, name, description)
          VALUES (?, ?, ?)
        `;

        const db = this.getDb();
        const stmt = db.prepare(query);
        stmt.run(id, data.name, data.description || null);

        // Obtener el proyecto creado
        const selectQuery = "SELECT * FROM projects WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const project = selectStmt.get(id) as Project;

        resolve(project);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener todos los proyectos
   */
  findAll(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT * FROM projects ORDER BY created_at DESC";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const projects = stmt.all() as Project[];

        resolve(projects);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener un proyecto por ID
   */
  findById(id: string): Promise<Project | null> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT * FROM projects WHERE id = ?";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const project = stmt.get(id) as Project | undefined;

        resolve(project || null);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Actualizar un proyecto
   */
  update(id: string, data: UpdateProjectData): Promise<Project | null> {
    return new Promise((resolve, reject) => {
      try {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
          fields.push("name = ?");
          values.push(data.name);
        }

        if (data.description !== undefined) {
          fields.push("description = ?");
          values.push(data.description);
        }

        if (fields.length === 0) {
          // Si no hay campos para actualizar, devolver el proyecto actual
          this.findById(id).then(resolve).catch(reject);
          return;
        }

        values.push(id);
        const query = `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`;

        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.run(...values);

        if (result.changes === 0) {
          resolve(null); // Proyecto no encontrado
          return;
        }

        // Obtener el proyecto actualizado
        const selectQuery = "SELECT * FROM projects WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const project = selectStmt.get(id) as Project;

        resolve(project);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Eliminar un proyecto
   */
  delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "DELETE FROM projects WHERE id = ?";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.run(id);

        resolve(result.changes > 0);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verificar si un proyecto existe
   */
  exists(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT 1 FROM projects WHERE id = ? LIMIT 1";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.get(id);

        resolve(!!result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
