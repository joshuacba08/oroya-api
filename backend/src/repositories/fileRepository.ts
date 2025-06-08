import { DatabaseSync } from "node:sqlite";
import { getDatabase } from "../config/database";

export interface FileRecord {
  id: string;
  original_name: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  is_image: boolean;
  width?: number;
  height?: number;
  compressed_path?: string;
  thumbnail_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFileData {
  original_name: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  is_image?: boolean;
  width?: number;
  height?: number;
  compressed_path?: string;
  thumbnail_path?: string;
}

export interface FieldFile {
  id: string;
  field_id: string;
  record_id: string;
  file_id: string;
  created_at: string;
}

export interface CreateFieldFileData {
  field_id: string;
  record_id: string;
  file_id: string;
}

export class FileRepository {
  private getDb(): DatabaseSync {
    return getDatabase();
  }

  /**
   * Crear un nuevo archivo
   */
  create(id: string, data: CreateFileData): Promise<FileRecord> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          INSERT INTO files (
            id, original_name, filename, mimetype, size, path, is_image,
            width, height, compressed_path, thumbnail_path
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const db = this.getDb();
        const stmt = db.prepare(query);
        stmt.run(
          id,
          data.original_name,
          data.filename,
          data.mimetype,
          data.size,
          data.path,
          data.is_image ? 1 : 0,
          data.width || null,
          data.height || null,
          data.compressed_path || null,
          data.thumbnail_path || null
        );

        // Obtener el archivo creado
        const selectQuery = "SELECT * FROM files WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const file = selectStmt.get(id) as FileRecord;

        resolve(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener un archivo por ID
   */
  findById(id: string): Promise<FileRecord | null> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT * FROM files WHERE id = ?";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const file = stmt.get(id) as FileRecord | undefined;

        resolve(file || null);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener archivos por IDs
   */
  findByIds(ids: string[]): Promise<FileRecord[]> {
    return new Promise((resolve, reject) => {
      try {
        if (ids.length === 0) {
          resolve([]);
          return;
        }

        const placeholders = ids.map(() => "?").join(",");
        const query = `SELECT * FROM files WHERE id IN (${placeholders})`;
        const db = this.getDb();
        const stmt = db.prepare(query);
        const files = stmt.all(...ids) as FileRecord[];

        resolve(files);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Eliminar un archivo
   */
  delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "DELETE FROM files WHERE id = ?";
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
   * Asociar un archivo con un campo y record
   */
  createFieldFile(id: string, data: CreateFieldFileData): Promise<FieldFile> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          INSERT INTO field_files (id, field_id, record_id, file_id)
          VALUES (?, ?, ?, ?)
        `;

        const db = this.getDb();
        const stmt = db.prepare(query);
        stmt.run(id, data.field_id, data.record_id, data.file_id);

        // Obtener la asociación creada
        const selectQuery = "SELECT * FROM field_files WHERE id = ?";
        const selectStmt = db.prepare(selectQuery);
        const fieldFile = selectStmt.get(id) as FieldFile;

        resolve(fieldFile);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener archivos de un campo específico para un record
   */
  findByFieldAndRecord(
    fieldId: string,
    recordId: string
  ): Promise<FileRecord[]> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          SELECT f.* FROM files f
          INNER JOIN field_files ff ON f.id = ff.file_id
          WHERE ff.field_id = ? AND ff.record_id = ?
          ORDER BY f.created_at ASC
        `;
        const db = this.getDb();
        const stmt = db.prepare(query);
        const files = stmt.all(fieldId, recordId) as FileRecord[];

        resolve(files);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Eliminar asociación entre archivo y campo
   */
  deleteFieldFile(
    fieldId: string,
    recordId: string,
    fileId: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          DELETE FROM field_files 
          WHERE field_id = ? AND record_id = ? AND file_id = ?
        `;
        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.run(fieldId, recordId, fileId);

        resolve(result.changes > 0);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verificar si un archivo existe
   */
  exists(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const query = "SELECT 1 FROM files WHERE id = ? LIMIT 1";
        const db = this.getDb();
        const stmt = db.prepare(query);
        const result = stmt.get(id);

        resolve(!!result);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener archivos huérfanos (sin asociaciones)
   */
  findOrphanFiles(): Promise<FileRecord[]> {
    return new Promise((resolve, reject) => {
      try {
        const query = `
          SELECT f.* FROM files f
          LEFT JOIN field_files ff ON f.id = ff.file_id
          WHERE ff.file_id IS NULL
        `;
        const db = this.getDb();
        const stmt = db.prepare(query);
        const files = stmt.all() as FileRecord[];

        resolve(files);
      } catch (error) {
        reject(error);
      }
    });
  }
}
