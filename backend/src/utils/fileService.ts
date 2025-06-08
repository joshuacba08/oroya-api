import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export interface FileProcessingResult {
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
}

export interface FileUploadOptions {
  maxSize?: number; // en bytes
  allowedExtensions?: string[];
  generateThumbnail?: boolean;
  compressImages?: boolean;
  thumbnailSize?: { width: number; height: number };
  compressionQuality?: number; // 1-100
}

export class FileService {
  private uploadDir: string;
  private thumbnailDir: string;
  private compressedDir: string;

  constructor() {
    // Directorios para almacenamiento local
    this.uploadDir = path.join(process.cwd(), "storage", "uploads");
    this.thumbnailDir = path.join(process.cwd(), "storage", "thumbnails");
    this.compressedDir = path.join(process.cwd(), "storage", "compressed");

    // Crear directorios si no existen
    this.ensureDirectories();
  }

  /**
   * Asegurar que los directorios de almacenamiento existan
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await fs.ensureDir(this.uploadDir);
      await fs.ensureDir(this.thumbnailDir);
      await fs.ensureDir(this.compressedDir);
      console.log("📁 Directorios de almacenamiento creados/verificados");
    } catch (error) {
      console.error("❌ Error creando directorios:", error);
      throw error;
    }
  }

  /**
   * Procesar archivo subido
   */
  async processFile(
    fileBuffer: Buffer,
    originalName: string,
    mimetype: string,
    options: FileUploadOptions = {}
  ): Promise<FileProcessingResult> {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB por defecto
      allowedExtensions = [],
      generateThumbnail = true,
      compressImages = true,
      thumbnailSize = { width: 200, height: 200 },
      compressionQuality = 80,
    } = options;

    // Validar tamaño
    if (fileBuffer.length > maxSize) {
      throw new Error(
        `El archivo excede el tamaño máximo permitido (${
          maxSize / 1024 / 1024
        }MB)`
      );
    }

    // Validar extensión
    const ext = path.extname(originalName).toLowerCase();
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
      throw new Error(
        `Extensión de archivo no permitida. Permitidas: ${allowedExtensions.join(
          ", "
        )}`
      );
    }

    const fileId = uuidv4();
    const filename = `${fileId}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    const isImage = this.isImageMimeType(mimetype);
    const result: FileProcessingResult = {
      id: fileId,
      original_name: originalName,
      filename,
      mimetype,
      size: fileBuffer.length,
      path: filePath,
      is_image: isImage,
    };

    try {
      // Guardar archivo original
      await fs.writeFile(filePath, fileBuffer);

      // Procesar imagen si es necesario
      if (isImage) {
        const imageMetadata = await sharp(fileBuffer).metadata();
        result.width = imageMetadata.width;
        result.height = imageMetadata.height;

        // Generar thumbnail
        if (generateThumbnail) {
          const thumbnailFilename = `thumb_${filename}`;
          const thumbnailPath = path.join(this.thumbnailDir, thumbnailFilename);

          await sharp(fileBuffer)
            .resize(thumbnailSize.width, thumbnailSize.height, {
              fit: "cover",
              position: "center",
            })
            .jpeg({ quality: 70 })
            .toFile(thumbnailPath);

          result.thumbnail_path = thumbnailPath;
        }

        // Comprimir imagen
        if (compressImages && this.shouldCompressImage(imageMetadata)) {
          const compressedFilename = `compressed_${filename}`;
          const compressedPath = path.join(
            this.compressedDir,
            compressedFilename
          );

          await sharp(fileBuffer)
            .jpeg({ quality: compressionQuality })
            .toFile(compressedPath);

          result.compressed_path = compressedPath;
        }
      }

      return result;
    } catch (error) {
      // Limpiar archivos en caso de error
      await this.cleanupFiles([
        filePath,
        result.thumbnail_path,
        result.compressed_path,
      ]);
      throw error;
    }
  }

  /**
   * Procesar múltiples archivos
   */
  async processFiles(
    files: Array<{ buffer: Buffer; originalName: string; mimetype: string }>,
    options: FileUploadOptions = {}
  ): Promise<FileProcessingResult[]> {
    const results: FileProcessingResult[] = [];

    for (const file of files) {
      try {
        const result = await this.processFile(
          file.buffer,
          file.originalName,
          file.mimetype,
          options
        );
        results.push(result);
      } catch (error) {
        console.error(`Error procesando archivo ${file.originalName}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Eliminar archivo y sus variantes
   */
  async deleteFile(
    filePath: string,
    thumbnailPath?: string,
    compressedPath?: string
  ): Promise<void> {
    const filesToDelete = [filePath, thumbnailPath, compressedPath].filter(
      Boolean
    ) as string[];
    await this.cleanupFiles(filesToDelete);
  }

  /**
   * Obtener archivo como stream
   */
  getFileStream(filePath: string): fs.ReadStream {
    if (!fs.existsSync(filePath)) {
      throw new Error("Archivo no encontrado");
    }
    return fs.createReadStream(filePath);
  }

  /**
   * Obtener información de archivo
   */
  async getFileInfo(
    filePath: string
  ): Promise<{ size: number; exists: boolean }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        exists: true,
      };
    } catch (error) {
      return {
        size: 0,
        exists: false,
      };
    }
  }

  /**
   * Convertir archivo a Base64
   */
  async fileToBase64(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return fileBuffer.toString("base64");
    } catch (error) {
      throw new Error(`Error convirtiendo archivo a Base64: ${error}`);
    }
  }

  /**
   * Guardar Base64 como archivo
   */
  async base64ToFile(
    base64Data: string,
    originalName: string,
    mimetype: string,
    options: FileUploadOptions = {}
  ): Promise<FileProcessingResult> {
    try {
      const fileBuffer = Buffer.from(base64Data, "base64");
      return await this.processFile(
        fileBuffer,
        originalName,
        mimetype,
        options
      );
    } catch (error) {
      throw new Error(`Error convirtiendo Base64 a archivo: ${error}`);
    }
  }

  /**
   * Verificar si es un tipo MIME de imagen
   */
  private isImageMimeType(mimetype: string): boolean {
    return mimetype.startsWith("image/");
  }

  /**
   * Determinar si la imagen necesita compresión
   */
  private shouldCompressImage(metadata: sharp.Metadata): boolean {
    const maxWidth = 1920;
    const maxHeight = 1080;

    return Boolean(
      (metadata.width && metadata.width > maxWidth) ||
        (metadata.height && metadata.height > maxHeight)
    );
  }

  /**
   * Limpiar archivos
   */
  private async cleanupFiles(filePaths: (string | undefined)[]): Promise<void> {
    for (const filePath of filePaths) {
      if (filePath) {
        try {
          await fs.remove(filePath);
        } catch (error) {
          console.warn(`No se pudo eliminar archivo: ${filePath}`, error);
        }
      }
    }
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStats(): Promise<{
    uploads: { count: number; totalSize: number };
    thumbnails: { count: number; totalSize: number };
    compressed: { count: number; totalSize: number };
  }> {
    const calculateDirStats = async (dirPath: string) => {
      try {
        const files = await fs.readdir(dirPath);
        let totalSize = 0;
        let count = 0;

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            totalSize += stats.size;
            count++;
          }
        }

        return { count, totalSize };
      } catch (error) {
        return { count: 0, totalSize: 0 };
      }
    };

    const [uploads, thumbnails, compressed] = await Promise.all([
      calculateDirStats(this.uploadDir),
      calculateDirStats(this.thumbnailDir),
      calculateDirStats(this.compressedDir),
    ]);

    return { uploads, thumbnails, compressed };
  }

  /**
   * Limpiar archivos huérfanos
   */
  async cleanupOrphanFiles(fileIds: string[]): Promise<void> {
    try {
      const allDirs = [this.uploadDir, this.thumbnailDir, this.compressedDir];

      for (const dir of allDirs) {
        const files = await fs.readdir(dir);

        for (const file of files) {
          const fileId = this.extractFileId(file);
          if (fileId && !fileIds.includes(fileId)) {
            const filePath = path.join(dir, file);
            await fs.remove(filePath);
            console.log(`🗑️ Archivo huérfano eliminado: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error("Error limpiando archivos huérfanos:", error);
    }
  }

  /**
   * Extraer ID de archivo del nombre de archivo
   */
  private extractFileId(filename: string): string | null {
    const match = filename.match(/^(?:thumb_|compressed_)?([a-f0-9-]{36})/);
    return match ? match[1] : null;
  }
}

// Instancia singleton
export const fileService = new FileService();
