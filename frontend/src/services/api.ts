import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Entity } from "../stores/entityStore";
import { Field, type FieldType } from "../stores/fieldStore";
import { Project } from "../stores/projectStore";

// Types for API responses
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// File Management Types
export interface FileItem {
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

export interface FileUploadResponse {
  success: boolean;
  message: string;
  files: FileItem[];
}

export interface FileBase64Response {
  success: boolean;
  base64: string;
  mimetype: string;
  originalName: string;
  size: number;
}

export interface FileUploadBase64Data {
  base64Data: string;
  originalName: string;
  mimetype: string;
  fieldId?: string;
  recordId?: string;
}

export interface StorageStats {
  uploads: { count: number; totalSize: number };
  thumbnails: { count: number; totalSize: number };
  compressed: { count: number; totalSize: number };
}

export interface StorageStatsResponse {
  success: boolean;
  stats: StorageStats;
}

export type FileVariant = "original" | "thumbnail" | "compressed";

export interface FileListResponse {
  success: boolean;
  files: FileItem[];
  total: number;
}

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

console.log("🔧 API Configuration - Base URL:", API_BASE_URL);

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login on unauthorized
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic API methods
  private async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url);
    return response.data;
  }

  private async post<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  private async put<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  private async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }

  private async patch<T>(url: string, data?: unknown): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data);
    return response.data;
  }

  // Project API methods
  async getProjects(): Promise<Project[]> {
    return this.get<Project[]>("/projects");
  }

  async createProject(
    data: Omit<Project, "id" | "createdAt" | "updatedAt">
  ): Promise<Project> {
    return this.post<Project>("/projects", data);
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.put<Project>(`/projects/${id}`, data);
  }

  async patchProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.patch<Project>(`/projects/${id}`, data);
  }

  async deleteProject(id: string): Promise<void> {
    return this.delete<void>(`/projects/${id}`);
  }

  async getProject(id: string): Promise<Project> {
    return this.get<Project>(`/projects/${id}`);
  }

  // Entity API methods
  async getEntitiesByProjectId(projectId: string): Promise<Entity[]> {
    const url = `/projects/${projectId}/entities`;
    console.log("🌐 API Service - Making request to:", `${API_BASE_URL}${url}`);
    const response = await this.get<ApiEntity[]>(url);
    console.log("📡 API Service - Raw response:", response);
    // Transform snake_case to camelCase
    const transformedEntities = response.map((entity: ApiEntity) => ({
      id: entity.id,
      projectId: entity.project_id,
      name: entity.name,
      description: entity.description,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    }));
    console.log("🔄 API Service - Transformed entities:", transformedEntities);
    return transformedEntities;
  }

  async createEntity(
    data: Omit<Entity, "id" | "createdAt" | "updatedAt">
  ): Promise<Entity> {
    return this.post<Entity>(`/projects/${data.projectId}/entities`, data);
  }

  async updateEntity(id: string, data: Partial<Entity>): Promise<Entity> {
    const { projectId } = data;
    return this.put<Entity>(`/projects/${projectId}/entities/${id}`, data);
  }

  async patchEntity(id: string, data: Partial<Entity>): Promise<Entity> {
    return this.patch<Entity>(`/entities/${id}`, data);
  }

  async deleteEntity(projectId: string, id: string): Promise<void> {
    return this.delete<void>(`/projects/${projectId}/entities/${id}`);
  }

  async getEntity(projectId: string, id: string): Promise<Entity> {
    return this.get<Entity>(`/projects/${projectId}/entities/${id}`);
  }

  // Field API methods
  async getFieldsByEntityId(
    projectId: string,
    entityId: string
  ): Promise<Field[]> {
    const url = `/projects/${projectId}/entities/${entityId}/fields`;
    console.log(
      "🌐 API Service - Making fields request to:",
      `${API_BASE_URL}${url}`
    );
    const response = await this.get<ApiField[]>(url);
    console.log("📡 API Service - Raw fields response:", response);

    // Transform snake_case to camelCase and convert integers to booleans
    const transformedFields = response.map((field: ApiField) => ({
      id: field.id,
      entityId: field.entity_id,
      name: field.name,
      type: field.type as FieldType,
      required: Boolean(field.is_required), // Convert 0/1 to boolean
      isUnique: Boolean(field.is_unique),
      defaultValue: field.default_value,
      maxLength: field.max_length,
      description: field.description,
      acceptsMultiple: Boolean(field.accepts_multiple),
      maxFileSize: field.max_file_size,
      allowedExtensions: field.allowed_extensions,
      createdAt: field.created_at,
      updatedAt: field.updated_at,
    }));

    console.log("🔄 API Service - Transformed fields:", transformedFields);
    return transformedFields;
  }

  async createField(
    projectId: string,
    data: Omit<Field, "id" | "createdAt" | "updatedAt">
  ): Promise<Field> {
    const url = `/projects/${projectId}/entities/${data.entityId}/fields`;
    console.log(
      "🌐 API Service - Creating field:",
      `${API_BASE_URL}${url}`,
      data
    );

    // Transform camelCase to snake_case for the request
    const requestData = {
      name: data.name,
      type: data.type,
      is_required: data.required ? 1 : 0, // Convert boolean to 0/1
      is_unique: data.isUnique ? 1 : 0,
      default_value: data.defaultValue || null,
      max_length: data.maxLength || null,
      description: data.description || null,
      accepts_multiple: data.acceptsMultiple ? 1 : 0,
      max_file_size: data.maxFileSize || null,
      allowed_extensions: data.allowedExtensions || null,
    };

    const response = await this.post<ApiField>(url, requestData);
    console.log("📡 API Service - Raw field creation response:", response);

    // Transform snake_case response back to camelCase
    const transformedField = {
      id: response.id,
      entityId: response.entity_id,
      name: response.name,
      type: response.type as FieldType,
      required: Boolean(response.is_required),
      isUnique: Boolean(response.is_unique),
      defaultValue: response.default_value,
      maxLength: response.max_length,
      description: response.description,
      acceptsMultiple: Boolean(response.accepts_multiple),
      maxFileSize: response.max_file_size,
      allowedExtensions: response.allowed_extensions,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
    };

    console.log(
      "🔄 API Service - Transformed created field:",
      transformedField
    );
    return transformedField;
  }

  async updateField(
    projectId: string,
    entityId: string,
    id: string,
    data: Partial<Field>
  ): Promise<Field> {
    // Transform camelCase to snake_case for the request
    const requestData: Partial<
      Omit<ApiField, "id" | "entity_id" | "created_at" | "updated_at">
    > = {};
    if (data.name !== undefined) requestData.name = data.name;
    if (data.type !== undefined) requestData.type = data.type;
    if (data.required !== undefined)
      requestData.is_required = data.required ? 1 : 0;
    if (data.isUnique !== undefined)
      requestData.is_unique = data.isUnique ? 1 : 0;
    if (data.defaultValue !== undefined)
      requestData.default_value = data.defaultValue;
    if (data.maxLength !== undefined) requestData.max_length = data.maxLength;
    if (data.description !== undefined)
      requestData.description = data.description;
    if (data.acceptsMultiple !== undefined)
      requestData.accepts_multiple = data.acceptsMultiple ? 1 : 0;
    if (data.maxFileSize !== undefined)
      requestData.max_file_size = data.maxFileSize;
    if (data.allowedExtensions !== undefined)
      requestData.allowed_extensions = data.allowedExtensions;

    const response = await this.put<ApiField>(
      `/projects/${projectId}/entities/${entityId}/fields/${id}`,
      requestData
    );

    // Transform snake_case response back to camelCase
    return {
      id: response.id,
      entityId: response.entity_id,
      name: response.name,
      type: response.type as FieldType,
      required: Boolean(response.is_required),
      isUnique: Boolean(response.is_unique),
      defaultValue: response.default_value,
      maxLength: response.max_length,
      description: response.description,
      acceptsMultiple: Boolean(response.accepts_multiple),
      maxFileSize: response.max_file_size,
      allowedExtensions: response.allowed_extensions,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
    };
  }

  async patchField(id: string, data: Partial<Field>): Promise<Field> {
    return this.patch<Field>(`/fields/${id}`, data);
  }

  async deleteField(
    projectId: string,
    entityId: string,
    id: string
  ): Promise<void> {
    return this.delete<void>(
      `/projects/${projectId}/entities/${entityId}/fields/${id}`
    );
  }

  // File Management API methods

  // Upload general files
  async uploadFiles(files: FileList | File[]): Promise<FileUploadResponse> {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response: AxiosResponse<FileUploadResponse> = await this.client.post(
      "/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Upload images specifically
  async uploadImages(images: FileList | File[]): Promise<FileUploadResponse> {
    const formData = new FormData();
    Array.from(images).forEach((image) => {
      formData.append("images", image);
    });

    const response: AxiosResponse<FileUploadResponse> = await this.client.post(
      "/files/upload/images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Upload from base64
  async uploadFromBase64(
    data: FileUploadBase64Data
  ): Promise<FileUploadResponse> {
    return this.post<FileUploadResponse>("/files/upload/base64", data);
  }

  // Get all files (for blob storage view)
  async getAllFiles(): Promise<FileItem[]> {
    const response = await this.get<FileListResponse>("/files");
    return response.files;
  }

  // Download file by ID
  async downloadFile(
    fileId: string,
    variant: FileVariant = "original"
  ): Promise<Blob> {
    const response = await this.client.get(`/files/${fileId}`, {
      params: { variant },
      responseType: "blob",
    });
    return response.data;
  }

  // Get file as base64
  async getFileAsBase64(
    fileId: string,
    variant: FileVariant = "original"
  ): Promise<FileBase64Response> {
    return this.get<FileBase64Response>(
      `/files/${fileId}/base64?variant=${variant}`
    );
  }

  // Delete file
  async deleteFile(fileId: string): Promise<void> {
    return this.delete<void>(`/files/${fileId}`);
  }

  // Get files by field and record
  async getFilesByField(
    fieldId: string,
    recordId: string
  ): Promise<FileItem[]> {
    return this.get<FileItem[]>(`/files/field/${fieldId}/record/${recordId}`);
  }

  // Get storage statistics
  async getStorageStats(): Promise<StorageStatsResponse> {
    return this.get<StorageStatsResponse>("/files/storage/stats");
  }

  // Get file metadata by ID
  async getFileMetadata(fileId: string): Promise<FileItem> {
    return this.get<FileItem>(`/files/${fileId}/metadata`);
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>("/auth/register", userData);
  }

  async logout(): Promise<void> {
    return this.post<void>("/auth/logout");
  }

  // Update file name
  async updateFile(
    fileId: string,
    data: { original_name: string }
  ): Promise<FileItem> {
    return this.put<FileItem>(`/files/${fileId}`, data);
  }
}

// API Response types (snake_case from backend)
interface ApiEntity {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ApiField {
  id: string;
  entity_id: string;
  name: string;
  type: string;
  is_required: number; // 0 or 1 (boolean as integer)
  is_unique: number;
  default_value: string | null;
  max_length: number | null;
  description: string | null;
  accepts_multiple: number;
  max_file_size: number | null;
  allowed_extensions: string | null;
  created_at: string;
  updated_at: string;
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
