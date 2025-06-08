import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Entity } from "../stores/entityStore";
import { Field } from "../stores/fieldStore";
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

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

  async deleteProject(id: string): Promise<void> {
    return this.delete<void>(`/projects/${id}`);
  }

  async getProject(id: string): Promise<Project> {
    return this.get<Project>(`/projects/${id}`);
  }

  // Entity API methods
  async getEntitiesByProjectId(projectId: string): Promise<Entity[]> {
    return this.get<Entity[]>(`/projects/${projectId}/entities`);
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
    return this.get<Field[]>(
      `/projects/${projectId}/entities/${entityId}/fields`
    );
  }

  async createField(
    projectId: string,
    data: Omit<Field, "id">
  ): Promise<Field> {
    return this.post<Field>(
      `/projects/${projectId}/entities/${data.entityId}/fields`,
      data
    );
  }

  async updateField(
    projectId: string,
    entityId: string,
    id: string,
    data: Partial<Field>
  ): Promise<Field> {
    return this.put<Field>(
      `/projects/${projectId}/entities/${entityId}/fields/${id}`,
      data
    );
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
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
