# API Library Documentation

Esta librería proporciona una interfaz completa para interactuar con la OroyaAPI, incluyendo servicios tipados, cliente HTTP configurado y constantes centralizadas.

## 🎯 ¿Qué hace esta librería?

La carpeta `src/lib/api` contiene la **capa de servicios** de la aplicación. Su propósito es:

- ✅ **Abstraer las peticiones HTTP** - Encapsula las llamadas a la API REST
- ✅ **Proporcionar tipado completo** - Tipos TypeScript para requests/responses
- ✅ **Centralizar configuración** - URLs, endpoints y constantes en un lugar
- ✅ **Manejar errores** - Tratamiento uniforme de errores HTTP
- ✅ **Organizar por dominios** - Servicios agrupados lógicamente (projects, entities, fields)

## 🔄 Diferencias con `/react-query`

| Aspecto | `/api` | `/react-query` |
|---------|--------|----------------|
| **Propósito** | Servicios HTTP puros | Hooks de React con estado |
| **Dependencias** | Solo fetch nativo | React Query + React |
| **Estado** | Sin estado | Maneja cache, loading, error |
| **Uso** | Funciones async/await | Hooks de React |
| **Reutilización** | Cualquier contexto JS | Solo componentes React |
| **Cache** | Sin cache | Cache automático |
| **Sincronización** | Manual | Automática |

### Ejemplo comparativo:

**Usando `/api` directamente:**
```tsx
import { projectService } from '../lib/api'

// En cualquier función JavaScript
async function loadProjects() {
  try {
    const projects = await projectService.getAll()
    console.log(projects)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

**Usando `/react-query` (recomendado en componentes):**
```tsx
import { useProjects } from '../lib/react-query'

// En componentes React
function ProjectsList() {
  const { data: projects, isLoading, error } = useProjects()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {projects?.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  )
}
```

## 📁 Estructura

```
src/lib/api/
├── client.ts      # Cliente HTTP con fetch configurado
├── constants.ts   # URLs base, endpoints y query keys
├── services.ts    # Servicios organizados por dominio
├── types.ts       # Tipos TypeScript de la API
├── index.ts       # Exportaciones principales
└── README.md      # Esta documentación
```

## 🚀 Inicio Rápido

```tsx
import { apiService, projectService } from './lib/api'

// Verificar salud de la API
const health = await apiService.health.check()

// Obtener todos los proyectos
const projects = await projectService.getAll()

// Crear un nuevo proyecto
const newProject = await projectService.create({
  name: 'Mi Proyecto',
  description: 'Descripción del proyecto'
})
```

## 🔧 Configuración

### Cliente HTTP

El cliente HTTP está configurado con:
- **Base URL**: `http://localhost:8080`
- **Headers**: `Content-Type: application/json`
- **Manejo de errores**: Automático con mensajes descriptivos
- **Soporte para 204 No Content**: Manejo de respuestas vacías

```tsx
import { httpClient } from './lib/api'

// Usar el cliente directamente
const data = await httpClient.get<MyType>('/custom-endpoint')
```

### Constantes

```tsx
import { API_BASE_URL, API_ENDPOINTS, QUERY_KEYS } from './lib/api'

console.log(API_BASE_URL) // 'http://localhost:8080'
console.log(API_ENDPOINTS.PROJECTS) // '/api/projects'
console.log(QUERY_KEYS.PROJECTS) // ['projects']
```

## 📚 Servicios Disponibles

### 🩺 Health Service

Servicios para verificar el estado de la API.

```tsx
import { healthService } from './lib/api'

// Health Check
const health = await healthService.check()
// Retorna: { status: 'OK', message: '...', timestamp: '...' }

// Información de la API
const apiInfo = await healthService.getApiInfo()
// Retorna: { name: '...', version: '...', description: '...', ... }
```

### 📁 Project Service

Servicios para gestión de proyectos.

```tsx
import { projectService } from './lib/api'

// Obtener todos los proyectos
const projects = await projectService.getAll()

// Obtener proyecto por ID
const project = await projectService.getById('project-id')

// Crear nuevo proyecto
const newProject = await projectService.create({
  name: 'Nombre del Proyecto',
  description: 'Descripción opcional'
})

// Obtener entidades de un proyecto
const entities = await projectService.getEntities('project-id')
```

### 📦 Entity Service

Servicios para gestión de entidades.

```tsx
import { entityService } from './lib/api'

// Obtener entidad por ID
const entity = await entityService.getById('entity-id')

// Crear nueva entidad
const newEntity = await entityService.create({
  projectId: 'project-id',
  name: 'User',
  description: 'Entidad de usuarios'
})

// Obtener campos de una entidad
const fields = await entityService.getFields('entity-id')

// Crear campo en una entidad
const newField = await entityService.createField('entity-id', {
  name: 'email',
  type: 'string',
  required: true
})
```

### 🧩 Field Service

Servicios para gestión de campos.

```tsx
import { fieldService } from './lib/api'

// Actualizar campo
const updatedField = await fieldService.update('field-id', {
  name: 'email_address',
  required: false
})

// Eliminar campo
await fieldService.delete('field-id')
```

### 🔄 API Service Combinado

Servicio que agrupa todos los servicios.

```tsx
import { apiService } from './lib/api'

// Equivalente a usar los servicios individuales
const health = await apiService.health.check()
const projects = await apiService.projects.getAll()
const entity = await apiService.entities.getById('entity-id')
const updatedField = await apiService.fields.update('field-id', { name: 'new_name' })
```

## 📝 Tipos TypeScript

### Tipos Principales

```tsx
import type { 
  Project, 
  Entity, 
  Field, 
  FieldType,
  CreateProjectRequest,
  CreateEntityRequest,
  CreateFieldRequest,
  UpdateFieldRequest 
} from './lib/api'

// Proyecto
const project: Project = {
  id: 'uuid',
  name: 'Nombre',
  description: 'Descripción',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

// Entidad
const entity: Entity = {
  id: 'uuid',
  projectId: 'project-uuid',
  name: 'User',
  description: 'Usuarios del sistema',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
}

// Campo
const field: Field = {
  id: 'uuid',
  entityId: 'entity-uuid',
  name: 'email',
  type: 'string', // 'string' | 'number' | 'boolean' | 'date'
  required: true
}
```

### Tipos de Datos Soportados

```tsx
import type { FieldType } from './lib/api'

const fieldTypes: FieldType[] = [
  'string',   // Cadena de texto
  'number',   // Número entero o decimal
  'boolean',  // Verdadero o falso
  'date'      // Fecha y hora ISO
]
```

### Requests de Creación

```tsx
import type { 
  CreateProjectRequest,
  CreateEntityRequest,
  CreateFieldRequest,
  UpdateFieldRequest 
} from './lib/api'

// Crear proyecto
const projectRequest: CreateProjectRequest = {
  name: 'Mi Proyecto',
  description: 'Descripción opcional' // opcional
}

// Crear entidad
const entityRequest: CreateEntityRequest = {
  projectId: 'project-uuid',
  name: 'User',
  description: 'Descripción opcional' // opcional
}

// Crear campo
const fieldRequest: CreateFieldRequest = {
  name: 'email',
  type: 'string',
  required: true // opcional, default: false
}

// Actualizar campo
const updateRequest: UpdateFieldRequest = {
  name: 'email_address', // opcional
  type: 'string',        // opcional
  required: false        // opcional
}
```

## 🔗 Endpoints Disponibles

### URLs Base
- **Desarrollo**: `http://localhost:8080`
- **Swagger**: `http://localhost:8080/api-docs`
- **Health**: `http://localhost:8080/health`

### Endpoints REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/` | Información de la API |
| `GET` | `/api/projects` | Listar proyectos |
| `POST` | `/api/projects` | Crear proyecto |
| `GET` | `/api/projects/:id` | Obtener proyecto |
| `GET` | `/api/projects/:id/entities` | Listar entidades del proyecto |
| `POST` | `/api/entities` | Crear entidad |
| `GET` | `/api/entities/:id` | Obtener entidad |
| `GET` | `/api/entities/:id/fields` | Listar campos de la entidad |
| `POST` | `/api/entities/:id/fields` | Crear campo |
| `PUT` | `/api/fields/:id` | Actualizar campo |
| `DELETE` | `/api/fields/:id` | Eliminar campo |

## 🔑 Query Keys

Para uso con React Query, las query keys están predefinidas:

```tsx
import { QUERY_KEYS } from './lib/api'

// Keys estáticas
QUERY_KEYS.HEALTH           // ['health']
QUERY_KEYS.API_INFO         // ['api-info']
QUERY_KEYS.PROJECTS         // ['projects']

// Keys dinámicas
QUERY_KEYS.PROJECT('id')              // ['projects', 'id']
QUERY_KEYS.PROJECT_ENTITIES('id')     // ['projects', 'id', 'entities']
QUERY_KEYS.ENTITY('id')               // ['entities', 'id']
QUERY_KEYS.ENTITY_FIELDS('id')        // ['entities', 'id', 'fields']
```

## 🎨 Cuándo usar cada librería

### Usa `/api` cuando:

- ✅ Necesites hacer peticiones fuera de componentes React
- ✅ Implementes lógica de negocio en servicios
- ✅ Quieras control total sobre el manejo de estados
- ✅ Desarrolles utilities o funciones helper
- ✅ Hagas testing unitario de servicios

```tsx
// ✅ Casos de uso apropiados
class ProjectManager {
  async createProjectWithEntities(data: any) {
    const project = await projectService.create(data.project)
    const entities = await Promise.all(
      data.entities.map(e => entityService.create({...e, projectId: project.id}))
    )
    return { project, entities }
  }
}

// En un middleware o helper
export async function validateApiHealth() {
  const health = await healthService.check()
  return health.status === 'OK'
}
```

### Usa `/react-query` cuando:

- ✅ Estés en componentes de React
- ✅ Necesites cache automático
- ✅ Quieras loading/error states sin configurar
- ✅ Requieras sincronización automática
- ✅ Prefieras hooks declarativos

```tsx
// ✅ Casos de uso apropiados
function ProjectsDashboard() {
  const { data: projects, isLoading } = useProjects()
  const createProject = useCreateProject()
  
  const handleCreate = () => {
    createProject.mutate({
      name: 'Nuevo Proyecto',
      description: 'Descripción'
    })
  }
  
  return (
    <div>
      {isLoading ? <Spinner /> : <ProjectsList projects={projects} />}
      <button onClick={handleCreate}>Crear</button>
    </div>
  )
}
```

## 🛠 Ejemplos Avanzados

### Manejo de Errores

```tsx
import { projectService } from './lib/api'

try {
  const project = await projectService.getById('invalid-id')
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message)
    // Error: Proyecto no encontrado
  }
}
```

### Uso con async/await

```tsx
import { apiService } from './lib/api'

async function createFullProject() {
  try {
    // 1. Crear proyecto
    const project = await apiService.projects.create({
      name: 'E-commerce',
      description: 'Sistema de comercio electrónico'
    })
    
    // 2. Crear entidad User
    const userEntity = await apiService.entities.create({
      projectId: project.id,
      name: 'User',
      description: 'Usuarios del sistema'
    })
    
    // 3. Agregar campos a la entidad
    const emailField = await apiService.entities.createField(userEntity.id, {
      name: 'email',
      type: 'string',
      required: true
    })
    
    const ageField = await apiService.entities.createField(userEntity.id, {
      name: 'age',
      type: 'number',
      required: false
    })
    
    console.log('Proyecto creado:', project)
    console.log('Entidad User creada:', userEntity)
    console.log('Campos creados:', [emailField, ageField])
    
  } catch (error) {
    console.error('Error creando proyecto:', error)
  }
}
```

### Uso con Promises

```tsx
import { projectService, entityService } from './lib/api'

projectService.getAll()
  .then(projects => {
    console.log('Proyectos:', projects)
    if (projects.length > 0) {
      return projectService.getEntities(projects[0].id)
    }
  })
  .then(entities => {
    console.log('Entidades del primer proyecto:', entities)
  })
  .catch(error => {
    console.error('Error:', error)
  })
```

## 🧪 Testing

Los servicios están diseñados para ser fáciles de testear:

```tsx
// Mock del cliente HTTP
jest.mock('./lib/api/client', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}))

import { httpClient } from './lib/api/client'
import { projectService } from './lib/api'

test('should get all projects', async () => {
  const mockProjects = [{ id: '1', name: 'Test Project' }]
  ;(httpClient.get as jest.Mock).mockResolvedValue(mockProjects)
  
  const result = await projectService.getAll()
  
  expect(httpClient.get).toHaveBeenCalledWith('/api/projects')
  expect(result).toEqual(mockProjects)
})
```

## 🔄 Integración con React Query

Esta librería está diseñada para funcionar perfectamente con React Query:

```tsx
import { useQuery, useMutation } from '@tanstack/react-query'
import { projectService, QUERY_KEYS } from './lib/api'

// Query
const { data: projects } = useQuery({
  queryKey: QUERY_KEYS.PROJECTS,
  queryFn: projectService.getAll
})

// Mutation
const createProject = useMutation({
  mutationFn: projectService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS })
  }
})
```

## 📋 Estado de Implementación

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| Health Check | ✅ Completo | Listo para uso |
| API Info | ✅ Completo | Listo para uso |
| Projects CRUD | ✅ Completo | Create, Read implementado |
| Entities CRUD | ✅ Completo | Create, Read implementado |
| Fields CRUD | ✅ Completo | Create, Read, Update, Delete |
| Error Handling | ✅ Completo | Manejo robusto de errores |
| TypeScript | ✅ Completo | Completamente tipado |
| Documentation | ✅ Completo | Documentación completa |

## 🏗 Arquitectura

```
Frontend Application
├── Components (React)
│   └── useReactQuery hooks (/react-query)
│       └── API Services (/api)
│           └── HTTP Client
│               └── OroyaAPI Backend
└── Services/Utils (Pure JS)
    └── API Services (/api) ← Direct usage
        └── HTTP Client
            └── OroyaAPI Backend
```

## 🤝 Contribuir

Para agregar nuevos endpoints:

1. Actualizar `types.ts` con los nuevos tipos
2. Agregar endpoints en `constants.ts`
3. Implementar servicios en `services.ts`
4. Agregar query keys si es necesario
5. Actualizar documentación

---

**Nota**: Esta implementación está basada en la documentación oficial de OroyaAPI v1.0.0 y está lista para producción con datos mock. La integración con base de datos está pendiente en el backend. 