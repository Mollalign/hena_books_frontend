import api from "@/lib/api";

export interface Book {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  file_url: string;
  page_count?: number;
  published_date?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookDetail extends Book {
  total_readers: number;
  total_reading_time_hours: number;
}

export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  per_page: number;
}

export interface BookReadResponse {
  book_id: string;
  title: string;
  file_url: string;
  page_count?: number;
}

export const booksService = {
  // Get all published books with pagination
  async getBooks(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    featured_only?: boolean;
  }): Promise<BookListResponse> {
    const response = await api.get<BookListResponse>("/books", { params });
    return response.data;
  },

  // Get featured books
  async getFeaturedBooks(limit: number = 5): Promise<Book[]> {
    const response = await api.get<Book[]>("/books/featured", {
      params: { limit },
    });
    return response.data;
  },

  // Get book by ID
  async getBookById(id: string): Promise<BookDetail> {
    const response = await api.get<BookDetail>(`/books/${id}`);
    return response.data;
  },

  // Get book for reading (requires auth)
  async getBookForReading(id: string): Promise<BookReadResponse> {
    const response = await api.get<BookReadResponse>(`/books/${id}/read`);
    return response.data;
  },

  // Admin: Get all books (including unpublished)
  async getAllBooks(): Promise<Book[]> {
    const response = await api.get<Book[]>("/books/admin/all");
    return response.data;
  },

  // Admin: Upload book
  async uploadBook(formData: FormData): Promise<Book> {
    const response = await api.post<Book>("/books/admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Admin: Update book
  async updateBook(id: string, data: Partial<Book>): Promise<Book> {
    const response = await api.put<Book>(`/books/admin/${id}`, data);
    return response.data;
  },

  // Admin: Delete book
  async deleteBook(id: string): Promise<void> {
    await api.delete(`/books/admin/${id}`);
  },
};

