import { httpClient } from "./client";
import { API_ENDPOINTS } from "./constants";
import {
  ApiInfo,
  CreateEntityRequest,
  CreateFieldRequest,
  CreateProjectRequest,
  Entity,
  Field,
  HealthResponse,
  Project,
  UpdateFieldRequest,
} from "./types";

// Health & Info Services
export const healthService = {
  check: (): Promise<HealthResponse> =>
    httpClient.get<HealthResponse>(API_ENDPOINTS.HEALTH),

  getApiInfo: (): Promise<ApiInfo> =>
    httpClient.get<ApiInfo>(API_ENDPOINTS.ROOT),
};

// Project Services
export const projectService = {
  getAll: (): Promise<Project[]> =>
    httpClient.get<Project[]>(API_ENDPOINTS.PROJECTS),

  getById: (id: string): Promise<Project> =>
    httpClient.get<Project>(API_ENDPOINTS.PROJECT_BY_ID(id)),

  create: (data: CreateProjectRequest): Promise<Project> =>
    httpClient.post<Project>(API_ENDPOINTS.PROJECTS, data),

  getEntities: (projectId: string): Promise<Entity[]> =>
    httpClient.get<Entity[]>(API_ENDPOINTS.PROJECT_ENTITIES(projectId)),
};

// Entity Services
export const entityService = {
  getById: (id: string): Promise<Entity> =>
    httpClient.get<Entity>(API_ENDPOINTS.ENTITY_BY_ID(id)),

  create: (data: CreateEntityRequest): Promise<Entity> =>
    httpClient.post<Entity>(API_ENDPOINTS.ENTITIES, data),

  getFields: (entityId: string): Promise<Field[]> =>
    httpClient.get<Field[]>(API_ENDPOINTS.ENTITY_FIELDS(entityId)),

  createField: (entityId: string, data: CreateFieldRequest): Promise<Field> =>
    httpClient.post<Field>(API_ENDPOINTS.ENTITY_FIELDS(entityId), data),
};

// Field Services
export const fieldService = {
  update: (id: string, data: UpdateFieldRequest): Promise<Field> =>
    httpClient.put<Field>(API_ENDPOINTS.FIELD_BY_ID(id), data),

  delete: (id: string): Promise<void> =>
    httpClient.delete<void>(API_ENDPOINTS.FIELD_BY_ID(id)),
};

// Combined API Service
export const apiService = {
  health: healthService,
  projects: projectService,
  entities: entityService,
  fields: fieldService,
};
