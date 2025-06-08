# 📡 OroyaAPI - Documentación de la API

Esta documentación describe todos los endpoints disponibles en el backend de OroyaAPI, incluyendo parámetros, ejemplos de uso y respuestas esperadas.

---

## 🔗 URLs Base

- **Servidor de desarrollo**: `http://localhost:8080`
- **Documentación Swagger**: `http://localhost:8080/api-docs`
- **Health Check**: `http://localhost:8080/health`

---

## 🧭 Endpoints Generales

### Health Check

Verifica que el servidor esté funcionando correctamente.

```http
GET /health
```

**Respuesta:**

```json
{
  "status": "OK",
  "message": "OroyaAPI Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Información de la API

Obtiene información general sobre la API y sus endpoints.

```http
GET /
```

**Respuesta:**

```json
{
  "name": "OroyaAPI Backend",
  "version": "1.0.0",
  "description": "API para gestión dinámica de proyectos, entidades y campos",
  "documentation": "http://localhost:8080/api-docs",
  "health": "http://localhost:8080/health",
  "endpoints": {
    "projects": "http://localhost:8080/api/projects",
    "entities": "http://localhost:8080/api/entities",
    "fields": "http://localhost:8080/api/fields"
  }
}
```

---

## 📁 Proyectos (Projects)

Los proyectos son contenedores que agrupan entidades relacionadas.

### Crear Proyecto

```http
POST /api/projects
```

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "name": "Mi Proyecto API",
  "description": "Proyecto para gestionar usuarios y productos"
}
```

| Campo         | Tipo   | Requerido | Descripción                       |
| ------------- | ------ | --------- | --------------------------------- |
| `name`        | string | ✅        | Nombre del proyecto               |
| `description` | string | ❌        | Descripción opcional del proyecto |

**Respuesta exitosa (201):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Mi Proyecto API",
  "description": "Proyecto para gestionar usuarios y productos",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Respuesta de error (400):**

```json
{
  "error": "Bad Request",
  "message": "El nombre del proyecto es requerido"
}
```

### Listar Proyectos

```http
GET /api/projects
```

**Respuesta exitosa (200):**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Mi Proyecto API",
    "description": "Proyecto para gestionar usuarios y productos",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Obtener Proyecto Específico

```http
GET /api/projects/{projectId}
```

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `projectId` | UUID | Identificador del proyecto |

**Respuesta exitosa (200):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Mi Proyecto API",
  "description": "Proyecto para gestionar usuarios y productos",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Respuesta de error (404):**

```json
{
  "error": "Not Found",
  "message": "Proyecto no encontrado"
}
```

---

## 📦 Entidades (Entities)

Las entidades representan tablas o recursos dentro de un proyecto.

### Listar Entidades de un Proyecto

```http
GET /api/projects/{projectId}/entities
```

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `projectId` | UUID | Identificador del proyecto |

**Respuesta exitosa (200):**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "name": "User",
    "description": "Entidad para gestionar usuarios del sistema",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Crear Entidad

```http
POST /api/entities
```

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "projectId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "User",
  "description": "Entidad para gestionar usuarios del sistema"
}
```

| Campo         | Tipo   | Requerido | Descripción                      |
| ------------- | ------ | --------- | -------------------------------- |
| `projectId`   | UUID   | ✅        | ID del proyecto al que pertenece |
| `name`        | string | ✅        | Nombre de la entidad             |
| `description` | string | ❌        | Descripción de la entidad        |

**Respuesta exitosa (201):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "projectId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "User",
  "description": "Entidad para gestionar usuarios del sistema",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Respuesta de error (400):**

```json
{
  "error": "Bad Request",
  "message": "El projectId y name son requeridos"
}
```

### Obtener Entidad Específica

```http
GET /api/entities/{entityId}
```

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entityId` | UUID | Identificador de la entidad |

**Respuesta exitosa (200):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "projectId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "User",
  "description": "Entidad para gestionar usuarios del sistema",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Respuesta de error (404):**

```json
{
  "error": "Not Found",
  "message": "Entidad no encontrada"
}
```

---

## 🧩 Campos (Fields)

Los campos definen los atributos de una entidad (equivalente a columnas de una tabla).

### Crear Campo

```http
POST /api/entities/{entityId}/fields
```

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entityId` | UUID | Identificador de la entidad |

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "name": "email",
  "type": "string",
  "required": true
}
```

| Campo      | Tipo    | Requerido | Descripción                                          |
| ---------- | ------- | --------- | ---------------------------------------------------- |
| `name`     | string  | ✅        | Nombre del campo                                     |
| `type`     | string  | ✅        | Tipo de dato (`string`, `number`, `boolean`, `date`) |
| `required` | boolean | ❌        | Si el campo es obligatorio (default: false)          |

**Respuesta exitosa (201):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "entityId": "123e4567-e89b-12d3-a456-426614174001",
  "name": "email",
  "type": "string",
  "required": true
}
```

**Respuesta de error (400) - Datos faltantes:**

```json
{
  "error": "Bad Request",
  "message": "El name y type son requeridos"
}
```

**Respuesta de error (400) - Tipo inválido:**

```json
{
  "error": "Bad Request",
  "message": "Tipo de dato inválido. Tipos permitidos: string, number, boolean, date"
}
```

### Listar Campos de una Entidad

```http
GET /api/entities/{entityId}/fields
```

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entityId` | UUID | Identificador de la entidad |

**Respuesta exitosa (200):**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174002",
    "entityId": "123e4567-e89b-12d3-a456-426614174001",
    "name": "email",
    "type": "string",
    "required": true
  },
  {
    "id": "123e4567-e89b-12d3-a456-426614174003",
    "entityId": "123e4567-e89b-12d3-a456-426614174001",
    "name": "age",
    "type": "number",
    "required": false
  }
]
```

### Actualizar Campo

```http
PUT /api/fields/{fieldId}
```

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fieldId` | UUID | Identificador del campo |

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "name": "email_address",
  "type": "string",
  "required": false
}
```

| Campo      | Tipo    | Requerido | Descripción                |
| ---------- | ------- | --------- | -------------------------- |
| `name`     | string  | ❌        | Nuevo nombre del campo     |
| `type`     | string  | ❌        | Nuevo tipo de dato         |
| `required` | boolean | ❌        | Si el campo es obligatorio |

**Respuesta exitosa (200):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "entityId": "123e4567-e89b-12d3-a456-426614174001",
  "name": "email_address",
  "type": "string",
  "required": false
}
```

**Respuesta de error (404):**

```json
{
  "error": "Not Found",
  "message": "Campo no encontrado"
}
```

### Eliminar Campo

```http
DELETE /api/fields/{fieldId}
```

**Parámetros de URL:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `fieldId` | UUID | Identificador del campo |

**Respuesta exitosa (204):**

```
No Content
```

**Respuesta de error (404):**

```json
{
  "error": "Not Found",
  "message": "Campo no encontrado"
}
```

---

## 📋 Códigos de Estado HTTP

| Código | Descripción                                                      |
| ------ | ---------------------------------------------------------------- |
| `200`  | ✅ **OK** - Solicitud exitosa                                    |
| `201`  | ✅ **Created** - Recurso creado exitosamente                     |
| `204`  | ✅ **No Content** - Solicitud exitosa sin contenido de respuesta |
| `400`  | ❌ **Bad Request** - Error en los datos enviados                 |
| `404`  | ❌ **Not Found** - Recurso no encontrado                         |
| `500`  | ❌ **Internal Server Error** - Error interno del servidor        |

---

## 🔧 Tipos de Datos Soportados

Para los campos de las entidades, se soportan los siguientes tipos:

| Tipo      | Descripción             | Ejemplo                      |
| --------- | ----------------------- | ---------------------------- |
| `string`  | Cadena de texto         | `"Hola mundo"`               |
| `number`  | Número entero o decimal | `42`, `3.14`                 |
| `boolean` | Verdadero o falso       | `true`, `false`              |
| `date`    | Fecha y hora            | `"2024-01-01T00:00:00.000Z"` |

---

## 🚀 Ejemplos de Uso Completo

### Ejemplo 1: Crear un proyecto completo con entidades y campos

```bash
# 1. Crear proyecto
curl -X POST http://localhost:8080/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-commerce API",
    "description": "API para gestionar productos y usuarios"
  }'

# Respuesta: { "id": "proj-123", "name": "E-commerce API", ... }

# 2. Crear entidad User
curl -X POST http://localhost:8080/api/entities \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj-123",
    "name": "User",
    "description": "Usuarios del sistema"
  }'

# Respuesta: { "id": "entity-456", "projectId": "proj-123", ... }

# 3. Agregar campos a User
curl -X POST http://localhost:8080/api/entities/entity-456/fields \
  -H "Content-Type: application/json" \
  -d '{
    "name": "email",
    "type": "string",
    "required": true
  }'

curl -X POST http://localhost:8080/api/entities/entity-456/fields \
  -H "Content-Type: application/json" \
  -d '{
    "name": "age",
    "type": "number",
    "required": false
  }'

# 4. Listar campos de la entidad
curl http://localhost:8080/api/entities/entity-456/fields
```

---

## 📚 Documentación Interactiva

Para una experiencia más interactiva, visita la documentación Swagger en:
**http://localhost:8080/api-docs**

La documentación Swagger te permite:

- ✅ Probar endpoints directamente desde el navegador
- ✅ Ver esquemas de datos detallados
- ✅ Generar código de ejemplo en múltiples lenguajes
- ✅ Validar requests y responses en tiempo real

---

## ⚠️ Notas Importantes

1. **UUIDs**: Todos los identificadores utilizan formato UUID v4
2. **Fechas**: Todas las fechas están en formato ISO 8601 UTC
3. **Validaciones**: Los campos requeridos son validados antes de procesar
4. **Estado Actual**: Los endpoints están implementados con datos mock, pendiente integración con SQLite
5. **CORS**: El servidor tiene CORS habilitado para desarrollo frontend

---

## 🔄 Estado de Implementación

| Endpoint                       | Estado  | Notas                     |
| ------------------------------ | ------- | ------------------------- |
| POST /api/projects             | ✅ Mock | Listo para integración DB |
| GET /api/projects              | ✅ Mock | Listo para integración DB |
| GET /api/projects/:id          | ✅ Mock | Listo para integración DB |
| GET /api/projects/:id/entities | ✅ Mock | Listo para integración DB |
| POST /api/entities             | ✅ Mock | Listo para integración DB |
| GET /api/entities/:id          | ✅ Mock | Listo para integración DB |
| POST /api/entities/:id/fields  | ✅ Mock | Con validaciones          |
| GET /api/entities/:id/fields   | ✅ Mock | Listo para integración DB |
| PUT /api/fields/:id            | ✅ Mock | Listo para integración DB |
| DELETE /api/fields/:id         | ✅ Mock | Listo para integración DB |

**Próximos pasos**: Integración con SQLite y implementación de relaciones entre entidades.
