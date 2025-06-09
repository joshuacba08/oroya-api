# 🛠️ OroyaAPI – Backend

Este módulo corresponde al backend de la aplicación **OroyaAPI**. Está construido con Node.js y Express, y utiliza SQLite como base de datos local. Permite crear proyectos, definir entidades dinámicas, asignar campos personalizados y establecer relaciones entre entidades.

---

## 📦 Tecnologías

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [SQLite](https://www.sqlite.org/index.html)

---

## 🧠 Descripción general

El backend se encarga de:

- Gestionar la lógica del sistema.
- Exponer endpoints HTTP para la comunicación con el frontend.
- Administrar la persistencia de datos mediante SQLite.
- Permitir que los usuarios creen sus propios modelos de datos de forma dinámica.

---

## 🗃️ Estructura del modelo de datos

La estructura de datos sigue una jerarquía:

```
Project
 └── Entity
      ├── Fields
      └── Relations → otras Entities
```

---

### 📁 `Project`

Representa un contenedor para agrupar entidades personalizadas definidas por el usuario.

**Campos:**

- `id` (`uuid`) – Identificador único.
- `name` (`string`) – Nombre del proyecto.
- `description` (`string`) – Descripción opcional.
- `createdAt` (`date`) – Fecha de creación.
- `updatedAt` (`date`) – Última modificación.

---

### 📦 `Entity`

Equivale a una tabla o recurso dentro de un proyecto.

**Campos:**

- `id` (`uuid`) – Identificador único.
- `projectId` (`uuid`) – Proyecto al que pertenece.
- `name` (`string`) – Nombre de la entidad.
- `description` (`string`) – Descripción de la entidad.
- `createdAt` (`date`)
- `updatedAt` (`date`)

---

### 🧩 `Field`

Define los atributos de una entidad. Es el equivalente a las columnas de una tabla.

**Campos:**

- `id` (`uuid`)
- `entityId` (`uuid`) – Entidad a la que pertenece.
- `name` (`string`) – Nombre del campo.
- `type` (`string`) – Tipo de dato (`string`, `number`, `boolean`, `date`, `text`, `integer`, `decimal`, `file`, `image`, `document`).
- `required` (`boolean`) – Si es obligatorio o no.
- `accepts_multiple` (`boolean`) – Si acepta múltiples archivos (solo para tipos file/image/document).
- `max_file_size` (`integer`) – Tamaño máximo del archivo en bytes.
- `allowed_extensions` (`string`) – Extensiones permitidas separadas por comas.

---

### 🔗 `Relation`

Define una relación entre dos entidades.

**Campos:**

- `id` (`uuid`)
- `entityId` (`uuid`) – Entidad origen de la relación.
- `relatedEntityId` (`uuid`) – Entidad destino de la relación.
- `fieldId` (`uuid`) – Campo asociado a esta relación.
- `relationType` (`string`) – Tipo de relación: `one-to-one`, `one-to-many`, `many-to-many`.

> ⚠️ Con esta estructura, se pueden representar relaciones complejas entre entidades dentro del mismo proyecto.

---

## 🛠️ Instalación y uso

```bash
pnpm install
pnpm dev
```

Esto levantará el servidor Express en `http://localhost:3001`.

---

## 📡 Endpoints esperados (básicos)

```http
POST   /api/projects
GET    /api/projects/:projectId/entities
POST   /api/entities/:entityId/fields
POST   /api/entities/:entityId/relations
GET    /api/entities/:entityId/records
POST   /api/entities/:entityId/records

# Endpoints de archivos
POST   /api/files/upload
POST   /api/files/upload/images
POST   /api/files/upload/base64
GET    /api/files/:id
GET    /api/files/:id/base64
DELETE /api/files/:id
GET    /api/files/field/:fieldId/record/:recordId
```

> La API es dinámica: los endpoints se generan según las entidades definidas por el usuario.

---

## 💾 Base de datos

Este backend utiliza **SQLite**, y la base de datos se guarda localmente como un archivo `.db` en la carpeta `data/`. Ideal para aplicaciones desktop sin conexión.

---

## 📁 Gestión de Archivos e Imágenes

El backend incluye un sistema completo de gestión de archivos e imágenes diseñado para aplicaciones locales (Electron).

### 🎯 Características

- **Almacenamiento local**: Los archivos se guardan en el directorio `storage/` del proyecto
- **Procesamiento de imágenes**: Generación automática de thumbnails y compresión
- **Múltiples formatos**: Soporte para imágenes, documentos y archivos generales
- **Base64**: Conversión bidireccional entre archivos y Base64
- **Validaciones**: Tamaño máximo, extensiones permitidas, tipos MIME

### 📂 Estructura de almacenamiento

```
storage/
├── uploads/          # Archivos originales
├── thumbnails/       # Miniaturas de imágenes (200x200px)
└── compressed/       # Versiones comprimidas de imágenes
```

### 🔧 Tipos de campo soportados

- **`file`**: Archivos generales (PDF, documentos, etc.)
- **`image`**: Imágenes con procesamiento automático (JPG, PNG, GIF, WebP)
- **`document`**: Documentos específicos (PDF, Word, Excel)

### 📋 Configuración de campos de archivo

Al crear un campo de tipo `file`, `image` o `document`, puedes configurar:

- `accepts_multiple`: Permite múltiples archivos
- `max_file_size`: Tamaño máximo en bytes (máximo 50MB)
- `allowed_extensions`: Extensiones permitidas (ej: ".jpg,.png,.pdf")

### 🚀 Uso básico

```javascript
// Crear campo de imagen
POST /api/entities/{entityId}/fields
{
  "name": "avatar",
  "type": "image",
  "accepts_multiple": false,
  "max_file_size": 5242880,
  "allowed_extensions": ".jpg,.png,.webp"
}

// Subir imagen
POST /api/files/upload/images
FormData: { images: [file1, file2] }

// Subir desde Base64
POST /api/files/upload/base64
{
  "base64Data": "data:image/jpeg;base64,/9j/4AAQ...",
  "originalName": "photo.jpg",
  "mimetype": "image/jpeg",
  "fieldId": "uuid",
  "recordId": "uuid"
}

// Obtener archivo como Base64
GET /api/files/{fileId}/base64?variant=thumbnail
```

---

## ✅ Roadmap

- [x] **Gestión de archivos e imágenes**: Sistema completo de almacenamiento local
- [x] **Procesamiento de imágenes**: Thumbnails y compresión automática
- [x] **Soporte Base64**: Conversión bidireccional para integración con frontend
- [x] **Validación de archivos**: Tamaño, extensiones y tipos MIME
- [x] **CRUD completo para Entities**: Create, Read, Update, Delete
- [x] **CRUD completo para Fields**: Create, Read, Update, Delete
- [x] **CRUD completo para Files**: Create, Read, Update, Delete
- [ ] Validación de tipos de campos dinámicos.
- [ ] Soporte para relaciones inversas automáticas.
- [ ] Exportación del esquema en JSON.
- [ ] Generación automática de documentación Swagger por entidad.
- [ ] Control de versiones para proyectos y esquemas.
- [ ] Limpieza automática de archivos huérfanos.
- [ ] Integración con servicios de nube (versión Pro).

---

## 📄 Licencia

MIT © [OroyaAPI]
