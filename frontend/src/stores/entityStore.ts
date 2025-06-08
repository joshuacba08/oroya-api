import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { apiService } from "../services/api";

export interface Entity {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface EntityState {
  entities: Entity[];
  loading: boolean;
  error: string | null;
  currentEntity: Entity | null;
}

interface EntityActions {
  // Entities CRUD
  setEntities: (entities: Entity[]) => void;
  addEntity: (entity: Entity) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;

  // Current entity management
  setCurrentEntity: (entity: Entity | null) => void;
  getEntityById: (id: string) => Entity | undefined;
  getEntitiesByProjectId: (projectId: string) => Entity[];

  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API actions
  fetchEntitiesByProjectId: (projectId: string) => Promise<void>;
  createEntity: (
    entityData: Omit<Entity, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateEntityRemote: (id: string, updates: Partial<Entity>) => Promise<void>;
  deleteEntityRemote: (projectId: string, id: string) => Promise<void>;

  // Clear entities when changing projects
  clearEntities: () => void;
}

type EntityStore = EntityState & EntityActions;

export const useEntityStore = create<EntityStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      entities: [],
      loading: false,
      error: null,
      currentEntity: null,

      // Actions
      setEntities: (entities) =>
        set((state) => {
          state.entities = entities;
        }),

      addEntity: (entity) =>
        set((state) => {
          state.entities.push(entity);
        }),

      updateEntity: (id, updates) =>
        set((state) => {
          const index = state.entities.findIndex((e) => e.id === id);
          if (index !== -1) {
            Object.assign(state.entities[index], updates);
            state.entities[index].updatedAt = new Date().toISOString();

            // Update current entity if it's the one being updated
            if (state.currentEntity?.id === id) {
              Object.assign(state.currentEntity, updates);
              state.currentEntity.updatedAt = new Date().toISOString();
            }
          }
        }),

      deleteEntity: (id) =>
        set((state) => {
          state.entities = state.entities.filter((e) => e.id !== id);

          // Clear current entity if it's the one being deleted
          if (state.currentEntity?.id === id) {
            state.currentEntity = null;
          }
        }),

      setCurrentEntity: (entity) =>
        set((state) => {
          state.currentEntity = entity;
        }),

      getEntityById: (id) => {
        return get().entities.find((e) => e.id === id);
      },

      getEntitiesByProjectId: (projectId) => {
        return get().entities.filter((e) => e.projectId === projectId);
      },

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      clearEntities: () =>
        set((state) => {
          state.entities = [];
          state.currentEntity = null;
          state.error = null;
        }),

      // API integration
      fetchEntitiesByProjectId: async (projectId) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const entities = await apiService.getEntitiesByProjectId(projectId);

          set((state) => {
            // Replace entities for this project
            state.entities = [
              ...state.entities.filter((e) => e.projectId !== projectId),
              ...entities,
            ];
            state.loading = false;
          });
        } catch (error) {
          console.error("Failed to fetch entities:", error);

          // Fallback to mock data
          const mockEntities: Entity[] = [
            {
              id: "entity-1",
              projectId: projectId,
              name: "User",
              description: "Gestión de usuarios del sistema",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
            {
              id: "entity-2",
              projectId: projectId,
              name: "Product",
              description: "Catálogo de productos",
              createdAt: "2024-01-02T00:00:00.000Z",
              updatedAt: "2024-01-02T00:00:00.000Z",
            },
          ];

          set((state) => {
            // Replace entities for this project
            state.entities = [
              ...state.entities.filter((e) => e.projectId !== projectId),
              ...mockEntities,
            ];
            state.loading = false;
            state.error = "API no disponible, usando datos de ejemplo";
          });
        }
      },

      createEntity: async (entityData) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const newEntity = await apiService.createEntity(entityData);

          set((state) => {
            state.entities.push(newEntity);
            state.loading = false;
          });
        } catch (error) {
          console.error("Failed to create entity:", error);

          // Fallback to local creation
          const newEntity: Entity = {
            id: `entity-${Date.now()}`,
            ...entityData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => {
            state.entities.push(newEntity);
            state.loading = false;
            state.error = "API no disponible, entidad creada localmente";
          });
        }
      },

      updateEntityRemote: async (id, updates) => {
        try {
          const updatedEntity = await apiService.updateEntity(id, updates);

          set((state) => {
            const index = state.entities.findIndex((e) => e.id === id);
            if (index !== -1) {
              state.entities[index] = updatedEntity;
            }

            if (state.currentEntity?.id === id) {
              state.currentEntity = updatedEntity;
            }
          });
        } catch (error) {
          console.error("Failed to update entity:", error);

          // Update locally as fallback
          get().updateEntity(id, updates);

          set((state) => {
            state.error = "API no disponible, cambios guardados localmente";
          });
        }
      },

      deleteEntityRemote: async (projectId, id) => {
        try {
          await apiService.deleteEntity(projectId, id);
          get().deleteEntity(id);
        } catch (error) {
          console.error("Failed to delete entity:", error);

          // Delete locally as fallback
          get().deleteEntity(id);

          set((state) => {
            state.error = "API no disponible, entidad eliminada localmente";
          });
        }
      },
    })),
    {
      name: "oroya-entities-storage",
      partialize: (state) => ({
        entities: state.entities,
        currentEntity: state.currentEntity,
      }),
    }
  )
);
