import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { FileRepository } from "../repositories/fileRepository";
import { fileService } from "../utils/fileService";
import { handleMulterError, upload, uploadImages } from "../utils/multerConfig";

const router = Router();
const fileRepository = new FileRepository();

/**
 * @swagger
 * components:
 *   schemas:
 *     FileRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         original_name:
 *           type: string
 *         filename:
 *           type: string
 *         mimetype:
 *           type: string
 *         size:
 *           type: integer
 *         is_image:
 *           type: boolean
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Subir archivos
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Archivos subidos exitosamente
 */
router.post("/upload", upload.array("files", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: "No se recibieron archivos",
      });
      return;
    }

    const processedFiles = [];

    for (const file of files) {
      const processedFile = await fileService.processFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      const fileRecord = await fileRepository.create(processedFile.id, {
        original_name: processedFile.original_name,
        filename: processedFile.filename,
        mimetype: processedFile.mimetype,
        size: processedFile.size,
        path: processedFile.path,
        is_image: processedFile.is_image,
        width: processedFile.width,
        height: processedFile.height,
        compressed_path: processedFile.compressed_path,
        thumbnail_path: processedFile.thumbnail_path,
      });

      processedFiles.push(fileRecord);
    }

    res.json({
      success: true,
      message: `${processedFiles.length} archivo(s) subido(s) exitosamente`,
      files: processedFiles,
    });
  } catch (error) {
    const multerError = handleMulterError(error);
    res.status(multerError.status).json({
      success: false,
      message: multerError.message,
    });
  }
});

/**
 * @swagger
 * /api/files/upload/images:
 *   post:
 *     summary: Subir imágenes
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Imágenes subidas exitosamente
 */
router.post(
  "/upload/images",
  uploadImages.array("images", 5),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: "No se recibieron imágenes",
        });
        return;
      }

      const processedFiles = [];

      for (const file of files) {
        const processedFile = await fileService.processFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          {
            maxSize: 5 * 1024 * 1024,
            generateThumbnail: true,
            compressImages: true,
          }
        );

        const fileRecord = await fileRepository.create(processedFile.id, {
          original_name: processedFile.original_name,
          filename: processedFile.filename,
          mimetype: processedFile.mimetype,
          size: processedFile.size,
          path: processedFile.path,
          is_image: processedFile.is_image,
          width: processedFile.width,
          height: processedFile.height,
          compressed_path: processedFile.compressed_path,
          thumbnail_path: processedFile.thumbnail_path,
        });

        processedFiles.push(fileRecord);
      }

      res.json({
        success: true,
        message: `${processedFiles.length} imagen(es) subida(s) exitosamente`,
        files: processedFiles,
      });
    } catch (error) {
      const multerError = handleMulterError(error);
      res.status(multerError.status).json({
        success: false,
        message: multerError.message,
      });
    }
  }
);

/**
 * @swagger
 * /api/files/upload/base64:
 *   post:
 *     summary: Subir archivo desde Base64
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente desde Base64
 */
router.post("/upload/base64", async (req, res) => {
  try {
    const { base64Data, originalName, mimetype, fieldId, recordId } = req.body;

    if (!base64Data || !originalName || !mimetype) {
      res.status(400).json({
        success: false,
        message: "Faltan datos requeridos: base64Data, originalName, mimetype",
      });
      return;
    }

    const processedFile = await fileService.base64ToFile(
      base64Data,
      originalName,
      mimetype
    );

    const fileRecord = await fileRepository.create(processedFile.id, {
      original_name: processedFile.original_name,
      filename: processedFile.filename,
      mimetype: processedFile.mimetype,
      size: processedFile.size,
      path: processedFile.path,
      is_image: processedFile.is_image,
      width: processedFile.width,
      height: processedFile.height,
      compressed_path: processedFile.compressed_path,
      thumbnail_path: processedFile.thumbnail_path,
    });

    // Si se proporcionan fieldId y recordId, crear la asociación
    if (fieldId && recordId) {
      await fileRepository.createFieldFile(uuidv4(), {
        field_id: fieldId,
        record_id: recordId,
        file_id: fileRecord.id,
      });
    }

    res.json({
      success: true,
      message: "Archivo subido exitosamente desde Base64",
      file: fileRecord,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Error subiendo archivo desde Base64",
    });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Descargar archivo por ID
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { variant = "original" } = req.query;

    const fileRecord = await fileRepository.findById(id);
    if (!fileRecord) {
      res.status(404).json({
        success: false,
        message: "Archivo no encontrado",
      });
      return;
    }

    let filePath = fileRecord.path;

    if (variant === "compressed" && fileRecord.compressed_path) {
      filePath = fileRecord.compressed_path;
    } else if (variant === "thumbnail" && fileRecord.thumbnail_path) {
      filePath = fileRecord.thumbnail_path;
    }

    const fileInfo = await fileService.getFileInfo(filePath);
    if (!fileInfo.exists) {
      res.status(404).json({
        success: false,
        message: "Archivo físico no encontrado",
      });
      return;
    }

    res.setHeader("Content-Type", fileRecord.mimetype);
    res.setHeader("Content-Length", fileInfo.size);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileRecord.original_name}"`
    );

    const fileStream = fileService.getFileStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error descargando archivo",
    });
  }
});

/**
 * @swagger
 * /api/files/{id}/base64:
 *   get:
 *     summary: Obtener archivo como Base64
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Archivo en Base64
 */
router.get("/:id/base64", async (req, res) => {
  try {
    const { id } = req.params;
    const { variant = "original" } = req.query;

    const fileRecord = await fileRepository.findById(id);
    if (!fileRecord) {
      res.status(404).json({
        success: false,
        message: "Archivo no encontrado",
      });
      return;
    }

    let filePath = fileRecord.path;

    if (variant === "compressed" && fileRecord.compressed_path) {
      filePath = fileRecord.compressed_path;
    } else if (variant === "thumbnail" && fileRecord.thumbnail_path) {
      filePath = fileRecord.thumbnail_path;
    }

    const base64Data = await fileService.fileToBase64(filePath);

    res.json({
      success: true,
      base64: base64Data,
      mimetype: fileRecord.mimetype,
      originalName: fileRecord.original_name,
      size: fileRecord.size,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error convirtiendo archivo a Base64",
    });
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Eliminar archivo
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Archivo eliminado exitosamente
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const fileRecord = await fileRepository.findById(id);
    if (!fileRecord) {
      res.status(404).json({
        success: false,
        message: "Archivo no encontrado",
      });
      return;
    }

    await fileService.deleteFile(
      fileRecord.path,
      fileRecord.thumbnail_path,
      fileRecord.compressed_path
    );

    await fileRepository.delete(id);

    res.json({
      success: true,
      message: "Archivo eliminado exitosamente",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error eliminando archivo",
    });
  }
});

/**
 * @swagger
 * /api/files/field/{fieldId}/record/{recordId}:
 *   get:
 *     summary: Obtener archivos de un campo para un record
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: Archivos del campo
 */
router.get("/field/:fieldId/record/:recordId", async (req, res) => {
  try {
    const { fieldId, recordId } = req.params;
    const files = await fileRepository.findByFieldAndRecord(fieldId, recordId);

    res.json({
      success: true,
      files,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error obteniendo archivos del campo",
    });
  }
});

export default router;
