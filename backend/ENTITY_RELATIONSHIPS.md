# Gestión de Relaciones entre Entidades y Claves

Este documento describe las nuevas funcionalidades implementadas para el manejo de claves primarias (PK), claves foráneas (FK) y relaciones entre entidades en OroyaAPI.

## 🆕 Nuevas Funcionalidades

### 1. Claves Primarias y Foráneas en Campos

Los campos ahora soportan:
- **Claves Primarias (PK)**: Campos que identifican únicamente un registro
- **Claves Foráneas (FK)**: Campos que referencian a otras entidades
- **Referencias específicas**: FK pueden apuntar a campos específicos de otras entidades

### 2. Relaciones entre Entidades

Sistema completo de relaciones que soporta:
- **Uno a Uno (1:1)**: `one_to_one`
- **Uno a Muchos (1:N)**: `one_to_many`
- **Muchos a Uno (N:1)**: `many_to_one`
- **Muchos a Muchos (N:M)**: `many_to_many`

## 📊 Estructura de Base de Datos

### Tabla `fields` (Actualizada)

```sql
CREATE TABLE fields (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_unique BOOLEAN DEFAULT false,
  is_primary_key BOOLEAN DEFAULT false,        -- ✨ NUEVO
  is_foreign_key BOOLEAN DEFAULT false,        -- ✨ NUEVO
  foreign_entity_id TEXT,                      -- ✨ NUEVO
  foreign_field_id TEXT,                       -- ✨ NUEVO
  default_value TEXT,
  max_length INTEGER,
  description TEXT,
  accepts_multiple BOOLEAN DEFAULT false,
  max_file_size INTEGER,
  allowed_extensions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (foreign_entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  FOREIGN KEY (foreign_field_id) REFERENCES fields(id) ON DELETE SET NULL
);
```

### Tabla `entity_relationships` (Nueva)

```sql
CREATE TABLE entity_relationships (
  id TEXT PRIMARY KEY,
  source_entity_id TEXT NOT NULL,
  target_entity_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('one_to_one', 'one_to_many', 'many_to_one', 'many_to_many')),
  source_field_id TEXT,
  target_field_id TEXT,
  name TEXT,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  cascade_delete BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (target_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (source_field_id) REFERENCES fields(id) ON DELETE SET NULL,
  FOREIGN KEY (target_field_id) REFERENCES fields(id) ON DELETE SET NULL,
  UNIQUE(source_entity_id, target_entity_id, source_field_id, target_field_id)
);
```

## 🔌 API Endpoints

### Campos con PK/FK

#### Crear Campo con Clave Primaria
```http
POST /api/entities/{entityId}/fields
Content-Type: application/json

{
  "name": "id",
  "type": "string",
  "is_primary_key": true,
  "is_required": true,
  "is_unique": true
}
```

#### Crear Campo con Clave Foránea
```http
POST /api/entities/{entityId}/fields
Content-Type: application/json

{
  "name": "user_id",
  "type": "string",
  "is_foreign_key": true,
  "foreign_entity_id": "uuid-de-entidad-usuario",
  "foreign_field_id": "uuid-del-campo-id-usuario",
  "is_required": true
}
```

### Relaciones entre Entidades

#### Obtener todas las relaciones
```http
GET /api/relationships
```

#### Crear relación
```http
POST /api/relationships
Content-Type: application/json

{
  "source_entity_id": "uuid-entidad-origen",
  "target_entity_id": "uuid-entidad-destino",
  "relationship_type": "one_to_many",
  "name": "user_posts",
  "description": "Un usuario puede tener muchos posts",
  "is_required": false,
  "cascade_delete": true
}
```

#### Obtener relación específica
```http
GET /api/relationships/{relationshipId}
```

#### Actualizar relación
```http
PUT /api/relationships/{relationshipId}
Content-Type: application/json

{
  "relationship_type": "many_to_many",
  "description": "Relación actualizada"
}
```

#### Eliminar relación
```http
DELETE /api/relationships/{relationshipId}
```

#### Obtener relaciones de una entidad
```http
GET /api/entities/{entityId}/relationships
```

### Información de Claves

#### Obtener claves primarias de una entidad
```http
GET /api/entities/{entityId}/primary-keys
```

#### Obtener claves foráneas de una entidad
```http
GET /api/entities/{entityId}/foreign-keys
```

#### Obtener campos que referencian a una entidad
```http
GET /api/entities/{entityId}/referenced-by
```

## 🔧 Migraciones

### Verificar estado de migraciones
```http
GET /api/debug/migrations
```

### Ejecutar migraciones manualmente
```http
POST /api/debug/migrations/run
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Blog con Usuarios y Posts

#### 1. Crear entidades
```http
POST /api/projects/{projectId}/entities
{
  "name": "User",
  "description": "Entidad de usuarios"
}

POST /api/projects/{projectId}/entities
{
  "name": "Post",
  "description": "Entidad de posts"
}
```

#### 2. Crear campos para User
```http
POST /api/entities/{userId}/fields
{
  "name": "id",
  "type": "string",
  "is_primary_key": true,
  "is_required": true,
  "is_unique": true
}

POST /api/entities/{userId}/fields
{
  "name": "email",
  "type": "string",
  "is_required": true,
  "is_unique": true
}
```

#### 3. Crear campos para Post
```http
POST /api/entities/{postId}/fields
{
  "name": "id",
  "type": "string",
  "is_primary_key": true,
  "is_required": true,
  "is_unique": true
}

POST /api/entities/{postId}/fields
{
  "name": "user_id",
  "type": "string",
  "is_foreign_key": true,
  "foreign_entity_id": "{userId}",
  "foreign_field_id": "{userIdFieldId}",
  "is_required": true
}
```

#### 4. Crear relación
```http
POST /api/relationships
{
  "source_entity_id": "{userId}",
  "target_entity_id": "{postId}",
  "relationship_type": "one_to_many",
  "name": "user_posts",
  "description": "Un usuario puede tener muchos posts",
  "cascade_delete": true
}
```

### Ejemplo 2: E-commerce con Productos y Categorías

#### Relación Muchos a Muchos
```http
POST /api/relationships
{
  "source_entity_id": "{productId}",
  "target_entity_id": "{categoryId}",
  "relationship_type": "many_to_many",
  "name": "product_categories",
  "description": "Un producto puede estar en múltiples categorías"
}
```

## 🔍 Validaciones

### Campos
- Un campo no puede ser PK y FK al mismo tiempo
- Si `is_foreign_key` es true, `foreign_entity_id` es requerido
- Si se especifica `foreign_field_id`, debe pertenecer a `foreign_entity_id`
- Las entidades y campos referenciados deben existir

### Relaciones
- Las entidades origen y destino deben existir
- Los campos especificados deben pertenecer a sus respectivas entidades
- No se permiten relaciones duplicadas entre las mismas entidades con los mismos campos

## 🚀 Migración Automática

El sistema ejecuta automáticamente las migraciones necesarias al iniciar:

1. **Detección automática**: Verifica si las nuevas columnas y tablas existen
2. **Migración segura**: Agrega columnas sin afectar datos existentes
3. **Logging completo**: Registra cada paso de la migración
4. **Rollback seguro**: Las migraciones son reversibles

## 📚 Documentación Swagger

Toda la nueva funcionalidad está documentada en Swagger:
- Esquemas actualizados para `Field` y `EntityRelationship`
- Ejemplos de uso para cada endpoint
- Validaciones y códigos de error

Accede a la documentación en: `http://localhost:8080/api-docs`

## 🔄 Compatibilidad

- **Retrocompatible**: Los campos existentes funcionan sin cambios
- **Migración automática**: Las bases de datos existentes se actualizan automáticamente
- **Valores por defecto**: Los nuevos campos tienen valores por defecto seguros

## 🛠️ Desarrollo

### Repositorios Actualizados
- `FieldRepository`: Métodos para PK/FK
- `EntityRelationshipRepository`: Gestión completa de relaciones

### Nuevos Archivos
- `entityRelationshipRepository.ts`: Repositorio de relaciones
- `relationships.ts`: Router de relaciones
- `migration.ts`: Sistema de migraciones

### Archivos Modificados
- `database.ts`: Nuevas tablas y columnas
- `fieldRepository.ts`: Soporte PK/FK
- `fields.ts`: Endpoints actualizados
- `entities.ts`: Nuevos endpoints de información
- `swagger.ts`: Esquemas actualizados 