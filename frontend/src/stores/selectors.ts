import { useMemo } from "react";
import { useEntityStore } from "./entityStore";
import { useFieldStore } from "./fieldStore";
import { useProjectStore } from "./projectStore";

// Project selectors
export const useProjectList = () => useProjectStore((state) => state.projects);

export const useCurrentProject = () =>
  useProjectStore((state) => state.currentProject);

export const useProjectById = (id: string) =>
  useProjectStore((state) => state.getProjectById(id));

export const useProjectLoading = () =>
  useProjectStore((state) => state.loading);

export const useProjectError = () => useProjectStore((state) => state.error);

export const useProjectActions = () =>
  useProjectStore((state) => ({
    fetchProjects: state.fetchProjects,
    createProject: state.createProject,
    updateProject: state.updateProjectRemote,
    deleteProject: state.deleteProjectRemote,
    setCurrentProject: state.setCurrentProject,
  }));

// Entity selectors
export const useEntityList = () => useEntityStore((state) => state.entities);

export const useEntitiesByProjectId = (projectId: string) => {
  const entities = useEntityStore((state) => state.entities);
  return useMemo(
    () => entities.filter((e) => e.projectId === projectId),
    [entities, projectId]
  );
};

export const useCurrentEntity = () =>
  useEntityStore((state) => state.currentEntity);

export const useEntityById = (id: string) =>
  useEntityStore((state) => state.getEntityById(id));

export const useEntityLoading = () => useEntityStore((state) => state.loading);

export const useEntityError = () => useEntityStore((state) => state.error);

export const useEntityActions = () =>
  useEntityStore((state) => ({
    fetchEntitiesByProjectId: state.fetchEntitiesByProjectId,
    createEntity: state.createEntity,
    updateEntity: state.updateEntityRemote,
    deleteEntity: state.deleteEntityRemote,
    setCurrentEntity: state.setCurrentEntity,
    clearEntities: state.clearEntities,
  }));

// Field selectors
export const useFieldList = () => useFieldStore((state) => state.fields);

export const useFieldsByEntityId = (entityId: string) => {
  const fields = useFieldStore((state) => state.fields);
  return useMemo(
    () => fields.filter((f) => f.entityId === entityId),
    [fields, entityId]
  );
};

export const useFieldById = (id: string) =>
  useFieldStore((state) => state.getFieldById(id));

export const useFieldLoading = () => useFieldStore((state) => state.loading);

export const useFieldError = () => useFieldStore((state) => state.error);

export const useFieldActions = () =>
  useFieldStore((state) => ({
    fetchFieldsByEntityId: state.fetchFieldsByEntityId,
    createField: state.createField,
    updateField: state.updateFieldRemote,
    deleteField: state.deleteFieldRemote,
    clearFields: state.clearFields,
    clearFieldsByEntityId: state.clearFieldsByEntityId,
  }));

// Combined selectors for complex queries
export const useProjectWithEntities = (projectId: string) => {
  const project = useProjectById(projectId);
  const entities = useEntitiesByProjectId(projectId);

  return {
    project,
    entities,
    hasEntities: entities.length > 0,
    entityCount: entities.length,
  };
};

export const useEntityWithFields = (entityId: string) => {
  const entity = useEntityById(entityId);
  const fields = useFieldsByEntityId(entityId);

  return useMemo(
    () => ({
      entity,
      fields,
      hasFields: fields.length > 0,
      fieldCount: fields.length,
      requiredFields: fields.filter((f) => f.required),
      optionalFields: fields.filter((f) => !f.required),
    }),
    [entity, fields]
  );
};

// Loading state selectors
export const useGlobalLoading = () => {
  const projectLoading = useProjectLoading();
  const entityLoading = useEntityLoading();
  const fieldLoading = useFieldLoading();

  return projectLoading || entityLoading || fieldLoading;
};

export const useGlobalError = () => {
  const projectError = useProjectError();
  const entityError = useEntityError();
  const fieldError = useFieldError();

  return projectError || entityError || fieldError;
};

// Stats selectors
export const useProjectStats = () =>
  useProjectStore((state) => ({
    totalProjects: state.projects.length,
    hasProjects: state.projects.length > 0,
  }));

export const useEntityStats = (projectId?: string) => {
  const allEntities = useEntityStore((state) => state.entities);

  return useMemo(() => {
    const projectEntities = projectId
      ? allEntities.filter((e) => e.projectId === projectId)
      : allEntities;

    return {
      totalEntities: projectEntities.length,
      hasEntities: projectEntities.length > 0,
      entitiesByProject: projectEntities.reduce((acc, entity) => {
        acc[entity.projectId] = (acc[entity.projectId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [allEntities, projectId]);
};

export const useFieldStats = (entityId?: string) => {
  const allFields = useFieldStore((state) => state.fields);

  return useMemo(() => {
    const entityFields = entityId
      ? allFields.filter((f) => f.entityId === entityId)
      : allFields;

    return {
      totalFields: entityFields.length,
      hasFields: entityFields.length > 0,
      requiredFieldsCount: entityFields.filter((f) => f.required).length,
      optionalFieldsCount: entityFields.filter((f) => !f.required).length,
      fieldsByType: entityFields.reduce((acc, field) => {
        acc[field.type] = (acc[field.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [allFields, entityId]);
};
