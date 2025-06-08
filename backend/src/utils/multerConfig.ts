import { Request } from "express";
import multer from "multer";

// Configuración de multer para almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro para validar tipos de archivo
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Lista de tipos MIME permitidos por defecto
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  // Verificar si el tipo MIME está permitido
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
};

// Configuración principal de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB por defecto
    files: 10, // Máximo 10 archivos por request
  },
});

// Configuración específica para imágenes
export const uploadImages = multer({
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const imageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (imageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Solo se permiten imágenes. Tipo recibido: ${file.mimetype}`)
      );
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB para imágenes
    files: 5,
  },
});

// Configuración para documentos
export const uploadDocuments = multer({
  storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const documentTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (documentTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Solo se permiten documentos. Tipo recibido: ${file.mimetype}`
        )
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB para documentos
    files: 5,
  },
});

// Middleware personalizado para validar archivos según campo
export const createFieldUploadMiddleware = (fieldConfig: {
  maxFileSize?: number;
  allowedExtensions?: string[];
  acceptsMultiple?: boolean;
  maxFiles?: number;
}) => {
  const {
    maxFileSize = 10 * 1024 * 1024,
    allowedExtensions = [],
    acceptsMultiple = false,
    maxFiles = 1,
  } = fieldConfig;

  return multer({
    storage,
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      // Si hay extensiones específicas definidas, validarlas
      if (allowedExtensions.length > 0) {
        const fileExt = file.originalname.split(".").pop()?.toLowerCase();
        const normalizedExtensions = allowedExtensions.map((ext) =>
          ext.toLowerCase().replace(".", "")
        );

        if (!fileExt || !normalizedExtensions.includes(fileExt)) {
          cb(
            new Error(
              `Extensión no permitida. Permitidas: ${allowedExtensions.join(
                ", "
              )}`
            )
          );
          return;
        }
      }

      cb(null, true);
    },
    limits: {
      fileSize: maxFileSize,
      files: acceptsMultiple ? maxFiles : 1,
    },
  });
};

// Tipos de error de multer
export const MulterErrorTypes = {
  LIMIT_FILE_SIZE: "LIMIT_FILE_SIZE",
  LIMIT_FILE_COUNT: "LIMIT_FILE_COUNT",
  LIMIT_UNEXPECTED_FILE: "LIMIT_UNEXPECTED_FILE",
} as const;

// Handler de errores de multer
export const handleMulterError = (
  error: any
): { status: number; message: string } => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case MulterErrorTypes.LIMIT_FILE_SIZE:
        return {
          status: 400,
          message: "El archivo excede el tamaño máximo permitido",
        };
      case MulterErrorTypes.LIMIT_FILE_COUNT:
        return {
          status: 400,
          message: "Se ha excedido el número máximo de archivos",
        };
      case MulterErrorTypes.LIMIT_UNEXPECTED_FILE:
        return { status: 400, message: "Campo de archivo inesperado" };
      default:
        return { status: 400, message: "Error en la subida de archivos" };
    }
  }

  if (error.message) {
    return { status: 400, message: error.message };
  }

  return { status: 500, message: "Error interno del servidor" };
};
