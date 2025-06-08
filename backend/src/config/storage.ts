import path from "path";

export const STORAGE_CONFIG = {
  // Directorios base
  BASE_DIR: path.join(process.cwd(), "storage"),
  UPLOADS_DIR: path.join(process.cwd(), "storage", "uploads"),
  THUMBNAILS_DIR: path.join(process.cwd(), "storage", "thumbnails"),
  COMPRESSED_DIR: path.join(process.cwd(), "storage", "compressed"),

  // Límites de archivos
  MAX_FILE_SIZE: {
    DEFAULT: 10 * 1024 * 1024, // 10MB
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    ABSOLUTE_MAX: 50 * 1024 * 1024, // 50MB
  },

  // Configuración de imágenes
  IMAGE_PROCESSING: {
    THUMBNAIL_SIZE: { width: 200, height: 200 },
    COMPRESSION_QUALITY: 80,
    COMPRESSION_THRESHOLD: {
      width: 1920,
      height: 1080,
    },
  },

  // Extensiones permitidas por tipo
  ALLOWED_EXTENSIONS: {
    IMAGE: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    DOCUMENT: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"],
    GENERAL: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".txt",
      ".zip",
      ".rar",
      ".7z",
      ".mp4",
      ".avi",
      ".mov",
      ".wmv",
      ".mp3",
      ".wav",
      ".flac",
    ],
  },

  // Tipos MIME permitidos
  ALLOWED_MIME_TYPES: {
    IMAGE: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    DOCUMENT: [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    GENERAL: [
      // Imágenes
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Documentos
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Archivos comprimidos
      "application/zip",
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      // Videos
      "video/mp4",
      "video/avi",
      "video/quicktime",
      "video/x-ms-wmv",
      // Audio
      "audio/mpeg",
      "audio/wav",
      "audio/flac",
    ],
  },
};

/**
 * Obtener configuración de archivo según el tipo de campo
 */
export const getFieldTypeConfig = (fieldType: string) => {
  switch (fieldType) {
    case "image":
      return {
        maxSize: STORAGE_CONFIG.MAX_FILE_SIZE.IMAGE,
        allowedExtensions: STORAGE_CONFIG.ALLOWED_EXTENSIONS.IMAGE,
        allowedMimeTypes: STORAGE_CONFIG.ALLOWED_MIME_TYPES.IMAGE,
        generateThumbnail: true,
        compressImages: true,
      };

    case "document":
      return {
        maxSize: STORAGE_CONFIG.MAX_FILE_SIZE.DOCUMENT,
        allowedExtensions: STORAGE_CONFIG.ALLOWED_EXTENSIONS.DOCUMENT,
        allowedMimeTypes: STORAGE_CONFIG.ALLOWED_MIME_TYPES.DOCUMENT,
        generateThumbnail: false,
        compressImages: false,
      };

    case "file":
    default:
      return {
        maxSize: STORAGE_CONFIG.MAX_FILE_SIZE.DEFAULT,
        allowedExtensions: STORAGE_CONFIG.ALLOWED_EXTENSIONS.GENERAL,
        allowedMimeTypes: STORAGE_CONFIG.ALLOWED_MIME_TYPES.GENERAL,
        generateThumbnail: false,
        compressImages: false,
      };
  }
};

/**
 * Validar si una extensión está permitida para un tipo de campo
 */
export const isExtensionAllowed = (
  extension: string,
  fieldType: string
): boolean => {
  const config = getFieldTypeConfig(fieldType);
  return config.allowedExtensions.includes(extension.toLowerCase());
};

/**
 * Validar si un tipo MIME está permitido para un tipo de campo
 */
export const isMimeTypeAllowed = (
  mimeType: string,
  fieldType: string
): boolean => {
  const config = getFieldTypeConfig(fieldType);
  return config.allowedMimeTypes.includes(mimeType.toLowerCase());
};

/**
 * Formatear tamaño de archivo en formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Obtener información de archivo desde el nombre
 */
export const getFileInfo = (filename: string) => {
  const extension = path.extname(filename).toLowerCase();
  const nameWithoutExt = path.basename(filename, extension);

  return {
    name: nameWithoutExt,
    extension,
    fullName: filename,
  };
};
