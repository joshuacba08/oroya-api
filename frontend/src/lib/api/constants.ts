// API Configuration
export const API_BASE_URL = "http://localhost:8080";

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  HEALTH: "/health",
  ROOT: "/",

  // Projects
  PROJECTS: "/api/projects",
  PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
  PROJECT_ENTITIES: (id: string) => `/api/projects/${id}/entities`,

  // Entities
  ENTITIES: "/api/entities",
  ENTITY_BY_ID: (id: string) => `/api/entities/${id}`,
  ENTITY_FIELDS: (id: string) => `/api/entities/${id}/fields`,

  // Fields
  FIELDS: "/api/fields",
  FIELD_BY_ID: (id: string) => `/api/fields/${id}`,
} as const;

// Query Keys
export const QUERY_KEYS = {
  HEALTH: ["health"] as const,
  API_INFO: ["api-info"] as const,
  PROJECTS: ["projects"] as const,
  PROJECT: (id: string) => ["projects", id] as const,
  PROJECT_ENTITIES: (id: string) => ["projects", id, "entities"] as const,
  ENTITY: (id: string) => ["entities", id] as const,
  ENTITY_FIELDS: (id: string) => ["entities", id, "fields"] as const,
} as const;
