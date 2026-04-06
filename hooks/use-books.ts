import { useQuery } from "@tanstack/react-query";
import { booksService, type BookFilters } from "@/lib/services/books";

export function useBooks(params: BookFilters) {
  return useQuery({
    queryKey: ["books", params],
    queryFn: () => booksService.getBooks(params),
    staleTime: 60_000,
  });
}

export function useFeaturedBooks(limit = 6) {
  return useQuery({
    queryKey: ["books", "featured", limit],
    queryFn: () => booksService.getFeaturedBooks(limit),
    staleTime: 5 * 60_000,
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ["books", id],
    queryFn: () => booksService.getBookById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}
