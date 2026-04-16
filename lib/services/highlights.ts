import api from "@/lib/api";

export interface HighlightArea {
  height: number;
  left: number;
  pageIndex: number;
  top: number;
  width: number;
}

export interface BookHighlight {
  id: string;
  book_id: string;
  page_index: number;
  color: string;
  quote: string;
  note?: string | null;
  highlight_areas: HighlightArea[];
  created_at: string;
  updated_at: string;
}

export interface HighlightCreateInput {
  page_index: number;
  color: string;
  quote: string;
  note?: string;
  highlight_areas: HighlightArea[];
}

export const highlightsService = {
  async list(bookId: string): Promise<BookHighlight[]> {
    const response = await api.get<BookHighlight[]>(`/books/${bookId}/highlights`);
    return response.data;
  },

  async create(bookId: string, data: HighlightCreateInput): Promise<BookHighlight> {
    const response = await api.post<BookHighlight>(`/books/${bookId}/highlights`, data);
    return response.data;
  },

  async remove(bookId: string, highlightId: string): Promise<void> {
    await api.delete(`/books/${bookId}/highlights/${highlightId}`);
  },
};
