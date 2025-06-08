import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../api/constants";
import { projectService } from "../../api/services";
import { CreateProjectRequest } from "../../api/types";

export function useProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: projectService.getAll,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECT(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}

export function useProjectEntities(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECT_ENTITIES(projectId),
    queryFn: () => projectService.getEntities(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
    },
  });
}
