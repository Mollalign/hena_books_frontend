import api from "@/lib/api";

// Book Categories - matches backend BookCategory enum
export type BookCategory =
  | "BIBLICAL_STUDIES"
  | "THEOLOGY"
  | "DEVOTIONAL"
  | "CHRISTIAN_LIVING"
  | "PRAYER_WORSHIP"
  | "CHURCH_HISTORY"
  | "APOLOGETICS"
  | "FAMILY_MARRIAGE"
  | "YOUTH_CHILDREN"
  | "MISSIONS_EVANGELISM"
  | "SPIRITUAL_GROWTH"
  | "BIOGRAPHY_TESTIMONY"
  | "COMMENTARY"
  | "REFERENCE"
  | "OTHER";

// Category display labels
export const CATEGORY_LABELS: Record<BookCategory, string> = {
  BIBLICAL_STUDIES: "Biblical Studies",
  THEOLOGY: "Theology",
  DEVOTIONAL: "Devotional",
  CHRISTIAN_LIVING: "Christian Living",
  PRAYER_WORSHIP: "Prayer & Worship",
  CHURCH_HISTORY: "Church History",
  APOLOGETICS: "Apologetics",
  FAMILY_MARRIAGE: "Family & Marriage",
  YOUTH_CHILDREN: "Youth & Children",
  MISSIONS_EVANGELISM: "Missions & Evangelism",
  SPIRITUAL_GROWTH: "Spiritual Growth",
  BIOGRAPHY_TESTIMONY: "Biography & Testimony",
  COMMENTARY: "Commentary",
  REFERENCE: "Reference",
  OTHER: "Other",
};

// Get all categories as array for dropdowns
export const BOOK_CATEGORIES = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({
    value: value as BookCategory,
    label,
  })
);

export interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  category: BookCategory;
  scripture_focus?: string;
  cover_url?: string;
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
  author?: string;
  file_url: string;
  page_count?: number;
}

export interface CategoryInfo {
  value: string;
  label: string;
}

export interface BookFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category?: BookCategory;
  featured_only?: boolean;
}

export const booksService = {
  // Get all published books with pagination and filters
  async getBooks(params?: BookFilters): Promise<BookListResponse> {
    const response = await api.get<BookListResponse>("/books", { params });
    return response.data;
  },

  // Get featured books
  async getFeaturedBooks(limit: number = 6): Promise<Book[]> {
    const response = await api.get<Book[]>("/books/featured", {
      params: { limit },
    });
    return response.data;
  },

  // Get all categories
  async getCategories(): Promise<{ categories: CategoryInfo[] }> {
    const response = await api.get<{ categories: CategoryInfo[] }>(
      "/books/categories"
    );
    return response.data;
  },

  // Get books by category
  async getBooksByCategory(
    category: BookCategory,
    limit: number = 10
  ): Promise<Book[]> {
    const response = await api.get<Book[]>(`/books/categories/${category}`, {
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

  // Admin: Toggle featured status
  async toggleFeatured(id: string): Promise<Book> {
    const response = await api.patch<Book>(
      `/books/admin/${id}/toggle-featured`
    );
    return response.data;
  },

  // Admin: Toggle published status
  async togglePublished(id: string): Promise<Book> {
    const response = await api.patch<Book>(
      `/books/admin/${id}/toggle-published`
    );
    return response.data;
  },

  // Admin: Delete book
  async deleteBook(id: string): Promise<void> {
    await api.delete(`/books/admin/${id}`);
  },
};

// Helper function to get category label
export function getCategoryLabel(category: BookCategory): string {
  return CATEGORY_LABELS[category] || category;
}