import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { apiService } from "../services/api";

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  currentProject: Project | null;
}

interface ProjectActions {
  // Projects CRUD
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Current project management
  setCurrentProject: (project: Project | null) => void;
  getProjectById: (id: string) => Project | undefined;

  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API actions
  fetchProjects: () => Promise<void>;
  createProject: (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateProjectRemote: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProjectRemote: (id: string) => Promise<void>;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      projects: [],
      loading: false,
      error: null,
      currentProject: null,

      // Actions
      setProjects: (projects) =>
        set((state) => {
          state.projects = projects;
        }),

      addProject: (project) =>
        set((state) => {
          state.projects.push(project);
        }),

      updateProject: (id, updates) =>
        set((state) => {
          const index = state.projects.findIndex((p) => p.id === id);
          if (index !== -1) {
            Object.assign(state.projects[index], updates);
            state.projects[index].updatedAt = new Date().toISOString();

            // Update current project if it's the one being updated
            if (state.currentProject?.id === id) {
              Object.assign(state.currentProject, updates);
              state.currentProject.updatedAt = new Date().toISOString();
            }
          }
        }),

      deleteProject: (id) =>
        set((state) => {
          state.projects = state.projects.filter((p) => p.id !== id);

          // Clear current project if it's the one being deleted
          if (state.currentProject?.id === id) {
            state.currentProject = null;
          }
        }),

      setCurrentProject: (project) =>
        set((state) => {
          state.currentProject = project;
        }),

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      // API integration
      fetchProjects: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const projects = await apiService.getProjects();

          set((state) => {
            state.projects = projects;
            state.loading = false;
          });
        } catch (error) {
          console.error("Failed to fetch projects:", error);

          // Fallback to mock data for development
          const mockProjects: Project[] = [
            {
              id: "proj-1",
              name: "E-commerce API",
              description:
                "API para gestionar productos y usuarios de una tienda online",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
            {
              id: "proj-2",
              name: "Blog API",
              description: "Sistema de gestión de contenido para blog",
              createdAt: "2024-01-02T00:00:00.000Z",
              updatedAt: "2024-01-02T00:00:00.000Z",
            },
          ];

          set((state) => {
            state.projects = mockProjects;
            state.loading = false;
            state.error = "API no disponible, usando datos de ejemplo";
          });
        }
      },

      createProject: async (projectData) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const newProject = await apiService.createProject(projectData);

          set((state) => {
            state.projects.push(newProject);
            state.loading = false;
          });
        } catch (error) {
          console.error("Failed to create project:", error);

          // Fallback to local creation
          const newProject: Project = {
            id: `proj-${Date.now()}`,
            ...projectData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => {
            state.projects.push(newProject);
            state.loading = false;
            state.error = "API no disponible, proyecto creado localmente";
          });
        }
      },

      updateProjectRemote: async (id, updates) => {
        try {
          const updatedProject = await apiService.updateProject(id, updates);

          set((state) => {
            const index = state.projects.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.projects[index] = updatedProject;
            }

            if (state.currentProject?.id === id) {
              state.currentProject = updatedProject;
            }
          });
        } catch (error) {
          console.error("Failed to update project:", error);

          // Update locally as fallback
          get().updateProject(id, updates);

          set((state) => {
            state.error = "API no disponible, cambios guardados localmente";
          });
        }
      },

      deleteProjectRemote: async (id) => {
        try {
          await apiService.deleteProject(id);
          get().deleteProject(id);
        } catch (error) {
          console.error("Failed to delete project:", error);

          // Delete locally as fallback
          get().deleteProject(id);

          set((state) => {
            state.error = "API no disponible, proyecto eliminado localmente";
          });
        }
      },
    })),
    {
      name: "oroya-projects-storage",
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    }
  )
);
