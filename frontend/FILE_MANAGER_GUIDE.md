# Sistema de Gestión de Archivos - Guía de Uso

## Descripción General

El sistema de gestión de archivos proporciona una interfaz similar a un blob storage para manejar archivos de manera centralizada. Incluye funcionalidades avanzadas como:

- **Subida de archivos**: Drag & drop, selección múltiple, subida desde base64
- **Gestión de imágenes**: Thumbnails automáticos, compresión, previsualización
- **Filtrado y búsqueda**: Por tipo, nombre, fecha, tamaño
- **Vistas múltiples**: Grid y lista
- **Operaciones masivas**: Selección múltiple, eliminación en lote
- **Estadísticas de almacenamiento**: Uso de espacio, contadores

## Estructura del Sistema

### 1. API Service (`src/services/api.ts`)

Se agregaron los siguientes endpoints:

```typescript
// Subida de archivos
uploadFiles(files: FileList | File[]): Promise<FileUploadResponse>
uploadImages(images: FileList | File[]): Promise<FileUploadResponse>
uploadFromBase64(data: FileUploadBase64Data): Promise<FileUploadResponse>

// Gestión de archivos
getAllFiles(): Promise<FileItem[]>
downloadFile(fileId: string, variant?: FileVariant): Promise<Blob>
getFileAsBase64(fileId: string, variant?: FileVariant): Promise<FileBase64Response>
deleteFile(fileId: string): Promise<void>

// Estadísticas
getStorageStats(): Promise<StorageStatsResponse>
```

### 2. Store de Gestión (`src/stores/fileManagerStore.ts`)

Store completo con Zustand + Immer que maneja:

- **Estado de archivos**: Lista, selección, filtros
- **Estado de UI**: Vistas, modales, drag & drop
- **Operaciones**: CRUD, filtrado, ordenamiento
- **Utilidades**: Formateo de tamaños, iconos de archivos

### 3. Página Principal (`src/pages/FileManager.tsx`)

Interfaz completa con:

- **Header con estadísticas**: Contadores de archivos, espacio usado
- **Controles de filtrado**: Búsqueda, tipo, ordenamiento
- **Vista dual**: Grid (tarjetas) y Lista (tabla)
- **Drag & Drop**: Zona de arrastre global
- **Modales**: Subida, previsualización
- **Selección múltiple**: Operaciones en lote

### 4. Componentes Auxiliares

- `FileDropZone`: Zona de arrastrar y soltar reutilizable
- `FileUploadProgress`: Indicador de progreso de subida

## Funcionalidades Principales

### Subida de Archivos

1. **Drag & Drop**: Arrastra archivos desde el explorador
2. **Botón Upload**: Modal con zona de selección
3. **Separación automática**: Imágenes vs otros archivos
4. **Progreso en tiempo real**: Barra de progreso

### Gestión de Archivos

1. **Vista Grid**: Tarjetas con thumbnails para imágenes
2. **Vista Lista**: Tabla con detalles completos
3. **Selección múltiple**: Click + Ctrl/Cmd
4. **Previsualización**: Doble click para ver archivos
5. **Descarga**: Botón individual o masiva

### Filtrado y Búsqueda

1. **Búsqueda por nombre**: Campo de texto en tiempo real
2. **Filtro por tipo**: Todos, Imágenes, Documentos, Otros
3. **Ordenamiento**: Nombre, Tamaño, Fecha, Tipo
4. **Orden ascendente/descendente**: Toggle

### Estadísticas

1. **Total de archivos**: Cantidad y espacio usado
2. **Imágenes**: Thumbnails generados
3. **Compresión**: Espacio ahorrado

## Integración con la API

### Tipos de Archivo Soportados

```typescript
interface FileItem {
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
  updated_at?: string;
}
```

### Variantes de Archivo

- `original`: Archivo original
- `thumbnail`: Miniatura (solo imágenes)
- `compressed`: Versión comprimida

### Endpoints de la API

```
GET    /files                     - Listar todos los archivos
POST   /files/upload              - Subir archivos generales
POST   /files/upload/images       - Subir imágenes (con procesamiento)
POST   /files/upload/base64       - Subir desde base64
GET    /files/:id                 - Descargar archivo
GET    /files/:id/base64          - Obtener como base64
GET    /files/:id/metadata        - Metadatos del archivo
DELETE /files/:id                 - Eliminar archivo
GET    /files/storage/stats       - Estadísticas de almacenamiento
```

## Navegación

El gestor de archivos está integrado en la navegación principal:

- **Ruta**: `/files`
- **Acceso**: Desde la barra de navegación en "Archivos"
- **Integración**: Con el sistema de proyectos existente

## Uso Recomendado

### Para Desarrolladores

1. **Importar el store**:
```typescript
import { useFileManagerStore } from '../stores/fileManagerStore';
```

2. **Usar en componentes**:
```typescript
const { files, uploadFiles, deleteFile } = useFileManagerStore();
```

3. **Integrar con formularios**:
```typescript
// Para campos de archivo en entidades
const handleFileUpload = async (files: FileList) => {
  await uploadFiles(files);
  // Asociar archivos con registros específicos
};
```

### Para Usuarios Finales

1. **Subir archivos**: Arrastra desde el explorador o usa el botón "Upload Files"
2. **Organizar**: Usa filtros y búsqueda para encontrar archivos
3. **Gestionar**: Selecciona múltiples archivos para operaciones en lote
4. **Previsualizar**: Doble click en imágenes para ver en grande
5. **Descargar**: Click en el botón de descarga

## Próximas Mejoras

1. **Carpetas**: Sistema de organización jerárquica
2. **Etiquetas**: Metadatos personalizados
3. **Compartir**: URLs públicas temporales
4. **Versionado**: Historial de cambios
5. **Integración**: Asociación directa con registros de entidades

## Consideraciones de Rendimiento

- **Lazy loading**: Los archivos se cargan bajo demanda
- **Thumbnails**: Se generan automáticamente para imágenes
- **Compresión**: Reduce el espacio de almacenamiento
- **Caché**: Los metadatos se almacenan en el store
- **Paginación**: Para listas grandes (futuro)

## Seguridad

- **Autenticación**: Requiere token JWT válido
- **Validación**: Tipos de archivo y tamaños
- **Sanitización**: Nombres de archivo seguros
- **Permisos**: Control de acceso por usuario (futuro) 