import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../api/constants";
import { healthService } from "../../api/services";

export function useHealthCheck() {
  return useQuery({
    queryKey: QUERY_KEYS.HEALTH,
    queryFn: healthService.check,
  });
}

export function useApiInfo() {
  return useQuery({
    queryKey: QUERY_KEYS.API_INFO,
    queryFn: healthService.getApiInfo,
  });
}
