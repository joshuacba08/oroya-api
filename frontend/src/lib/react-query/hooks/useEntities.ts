import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../api/constants";
import { entityService } from "../../api/services";
import { CreateEntityRequest, CreateFieldRequest } from "../../api/types";

export function useEntity(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ENTITY(id),
    queryFn: () => entityService.getById(id),
    enabled: !!id,
  });
}

export function useEntityFields(entityId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ENTITY_FIELDS(entityId),
    queryFn: () => entityService.getFields(entityId),
    enabled: !!entityId,
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntityRequest) => entityService.create(data),
    onSuccess: (newEntity) => {
      // Invalidate project entities list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECT_ENTITIES(newEntity.projectId),
      });
    },
  });
}

export function useCreateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityId,
      data,
    }: {
      entityId: string;
      data: CreateFieldRequest;
    }) => entityService.createField(entityId, data),
    onSuccess: (newField) => {
      // Invalidate entity fields list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ENTITY_FIELDS(newField.entityId),
      });
    },
  });
}
