// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Health Check
export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

// API Info
export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  documentation: string;
  health: string;
  endpoints: {
    projects: string;
    entities: string;
    fields: string;
  };
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

// Entity Types
export interface Entity {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityRequest {
  projectId: string;
  name: string;
  description?: string;
}

// Field Types
export type FieldType = "string" | "number" | "boolean" | "date";

export interface Field {
  id: string;
  entityId: string;
  name: string;
  type: FieldType;
  required: boolean;
}

export interface CreateFieldRequest {
  name: string;
  type: FieldType;
  required?: boolean;
}

export interface UpdateFieldRequest {
  name?: string;
  type?: FieldType;
  required?: boolean;
}

// Error Types
export interface ApiError {
  error: string;
  message: string;
}
