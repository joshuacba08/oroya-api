import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { apiService } from "../services/api";

export type FieldType = "string" | "number" | "boolean" | "date";

export interface Field {
  id: string;
  entityId: string;
  name: string;
  type: FieldType;
  required: boolean;
}

interface FieldState {
  fields: Field[];
  loading: boolean;
  error: string | null;
}

interface FieldActions {
  // Fields CRUD
  setFields: (fields: Field[]) => void;
  addField: (field: Field) => void;
  updateField: (id: string, updates: Partial<Field>) => void;
  deleteField: (id: string) => void;

  // Field queries
  getFieldById: (id: string) => Field | undefined;
  getFieldsByEntityId: (entityId: string) => Field[];

  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API actions
  fetchFieldsByEntityId: (entityId: string) => Promise<void>;
  createField: (fieldData: Omit<Field, "id">) => Promise<void>;
  updateFieldRemote: (
    projectId: string,
    entityId: string,
    id: string,
    updates: Partial<Field>
  ) => Promise<void>;
  deleteFieldRemote: (
    projectId: string,
    entityId: string,
    id: string
  ) => Promise<void>;

  // Clear fields when changing entities
  clearFields: () => void;
  clearFieldsByEntityId: (entityId: string) => void;
}

type FieldStore = FieldState & FieldActions;

export const useFieldStore = create<FieldStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      fields: [],
      loading: false,
      error: null,

      // Actions
      setFields: (fields) =>
        set((state) => {
          state.fields = fields;
        }),

      addField: (field) =>
        set((state) => {
          state.fields.push(field);
        }),

      updateField: (id, updates) =>
        set((state) => {
          const index = state.fields.findIndex((f) => f.id === id);
          if (index !== -1) {
            Object.assign(state.fields[index], updates);
          }
        }),

      deleteField: (id) =>
        set((state) => {
          state.fields = state.fields.filter((f) => f.id !== id);
        }),

      getFieldById: (id) => {
        return get().fields.find((f) => f.id === id);
      },

      getFieldsByEntityId: (entityId) => {
        return get().fields.filter((f) => f.entityId === entityId);
      },

      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      clearFields: () =>
        set((state) => {
          state.fields = [];
          state.error = null;
        }),

      clearFieldsByEntityId: (entityId) =>
        set((state) => {
          state.fields = state.fields.filter((f) => f.entityId !== entityId);
        }),

      // API integration
      fetchFieldsByEntityId: async (entityId) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Note: We need projectId for the API call, but it's not available here
          // This is a limitation that would need to be addressed in a real app
          // For now, we'll use mock data with a fallback approach
          throw new Error("API integration needs projectId");
        } catch (error) {
          console.error("Failed to fetch fields:", error);

          // Fallback to mock data
          const mockFields: Field[] = [
            {
              id: "field-1",
              entityId: entityId,
              name: "id",
              type: "string",
              required: true,
            },
            {
              id: "field-2",
              entityId: entityId,
              name: "name",
              type: "string",
              required: true,
            },
            {
              id: "field-3",
              entityId: entityId,
              name: "email",
              type: "string",
              required: false,
            },
            {
              id: "field-4",
              entityId: entityId,
              name: "age",
              type: "number",
              required: false,
            },
            {
              id: "field-5",
              entityId: entityId,
              name: "isActive",
              type: "boolean",
              required: false,
            },
          ];

          set((state) => {
            // Replace fields for this entity
            state.fields = [
              ...state.fields.filter((f) => f.entityId !== entityId),
              ...mockFields,
            ];
            state.loading = false;
            state.error = "API no disponible, usando datos de ejemplo";
          });
        }
      },

      createField: async (fieldData) => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          // Note: This also needs projectId for the API call
          throw new Error("API integration needs projectId");
        } catch (error) {
          console.error("Failed to create field:", error);

          // Fallback to local creation
          const newField: Field = {
            id: `field-${Date.now()}`,
            ...fieldData,
          };

          set((state) => {
            state.fields.push(newField);
            state.loading = false;
            state.error = "API no disponible, campo creado localmente";
          });
        }
      },

      updateFieldRemote: async (projectId, entityId, id, updates) => {
        try {
          const updatedField = await apiService.updateField(
            projectId,
            entityId,
            id,
            updates
          );

          set((state) => {
            const index = state.fields.findIndex((f) => f.id === id);
            if (index !== -1) {
              state.fields[index] = updatedField;
            }
          });
        } catch (error) {
          console.error("Failed to update field:", error);

          // Update locally as fallback
          get().updateField(id, updates);

          set((state) => {
            state.error = "API no disponible, cambios guardados localmente";
          });
        }
      },

      deleteFieldRemote: async (projectId, entityId, id) => {
        try {
          await apiService.deleteField(projectId, entityId, id);
          get().deleteField(id);
        } catch (error) {
          console.error("Failed to delete field:", error);

          // Delete locally as fallback
          get().deleteField(id);

          set((state) => {
            state.error = "API no disponible, campo eliminado localmente";
          });
        }
      },
    })),
    {
      name: "oroya-fields-storage",
      partialize: (state) => ({
        fields: state.fields,
      }),
    }
  )
);
