# React Query Configuration

Esta carpeta contiene la configuración completa de React Query para la aplicación, incluyendo servicios de API, hooks personalizados y configuración del cliente.

## Estructura

```
src/lib/react-query/
├── queryClient.ts      # Configuración del cliente de React Query
├── QueryProvider.tsx   # Componente provider para envolver la app
├── hooks/             # Hooks personalizados para cada servicio
│   ├── useHealth.ts   # Hooks para health check y API info
│   ├── useProjects.ts # Hooks para gestión de proyectos
│   ├── useEntities.ts # Hooks para gestión de entidades
│   ├── useFields.ts   # Hooks para gestión de campos
│   └── index.ts       # Exportaciones de todos los hooks
└── index.ts           # Exportaciones principales
```

## Uso

### 1. Configuración básica

La aplicación ya está envuelta con el `QueryProvider` en `main.tsx`:

```tsx
import { QueryProvider } from "./lib/react-query";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
);
```

### 2. Usando los hooks

#### Health Check

```tsx
import { useHealthCheck, useApiInfo } from "./lib/react-query";

function HealthComponent() {
  const { data: health, isLoading } = useHealthCheck();
  const { data: apiInfo } = useApiInfo();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Status: {health?.status}</p>
      <p>
        API: {apiInfo?.name} v{apiInfo?.version}
      </p>
    </div>
  );
}
```

#### Proyectos

```tsx
import { useProjects, useCreateProject } from "./lib/react-query";

function ProjectsComponent() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();

  const handleCreate = () => {
    createProject.mutate({
      name: "Nuevo Proyecto",
      description: "Descripción del proyecto",
    });
  };

  return (
    <div>
      <button onClick={handleCreate}>Crear Proyecto</button>
      {projects?.map((project) => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

#### Entidades

```tsx
import { useEntity, useEntityFields, useCreateEntity } from "./lib/react-query";

function EntityComponent({ entityId }: { entityId: string }) {
  const { data: entity } = useEntity(entityId);
  const { data: fields } = useEntityFields(entityId);
  const createEntity = useCreateEntity();

  return (
    <div>
      <h2>{entity?.name}</h2>
      <div>
        {fields?.map((field) => (
          <div key={field.id}>
            {field.name} ({field.type})
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Configuración del cliente

El cliente está configurado con:

- **staleTime**: 5 minutos
- **gcTime**: 10 minutos
- **retry**: 3 intentos para queries, 1 para mutations
- **refetchOnWindowFocus**: deshabilitado

### 4. DevTools

Las React Query DevTools están habilitadas en desarrollo y se pueden abrir presionando el botón flotante en la esquina inferior izquierda.

## API Services

Los servicios están organizados por dominio:

- **healthService**: Health check y información de la API
- **projectService**: CRUD de proyectos
- **entityService**: CRUD de entidades y campos
- **fieldService**: Actualización y eliminación de campos

## Query Keys

Las query keys están centralizadas en `src/lib/api/constants.ts` para evitar duplicación y facilitar la invalidación de cache.

## Ejemplo completo

Ver `src/components/examples/ApiExample.tsx` para un ejemplo completo de uso de todos los hooks disponibles.
