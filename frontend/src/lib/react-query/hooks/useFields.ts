import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../api/constants";
import { fieldService } from "../../api/services";
import { UpdateFieldRequest } from "../../api/types";

export function useUpdateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFieldRequest }) =>
      fieldService.update(id, data),
    onSuccess: (updatedField) => {
      // Invalidate entity fields list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ENTITY_FIELDS(updatedField.entityId),
      });
    },
  });
}

export function useDeleteField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fieldService.delete(id),
    onSuccess: () => {
      // Invalidate all entity fields queries since we don't have entityId in the response
      queryClient.invalidateQueries({
        queryKey: ["entities"],
        predicate: (query) => {
          return query.queryKey.includes("fields");
        },
      });
    },
  });
}
