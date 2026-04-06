import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/lib/services/analytics";

export function useOverviewStats() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsService.getOverviewStats(),
    staleTime: 2 * 60_000,
  });
}

export function useBookStats() {
  return useQuery({
    queryKey: ["analytics", "books"],
    queryFn: () => analyticsService.getBookStats(),
    staleTime: 2 * 60_000,
  });
}

export function useReaderActivity(limit = 20) {
  return useQuery({
    queryKey: ["analytics", "readers", limit],
    queryFn: () => analyticsService.getReaderActivity(limit),
    staleTime: 2 * 60_000,
  });
}

export function useMyReadingStats() {
  return useQuery({
    queryKey: ["reading", "my-stats"],
    queryFn: () => analyticsService.getMyReadingStats(),
    staleTime: 60_000,
  });
}
