import api from "@/lib/api";

export interface ReadingSession {
  id: number;
  user_id: number;
  book_id: number;
  started_at: string;
  ended_at?: string;
  last_page_read: number;
  total_time_seconds: number;
}

export interface ReadingSessionCreate {
  book_id: number | string; // Backend expects number but books use UUID
}

export interface ReadingSessionUpdate {
  last_page_read?: number;
  time_spent_seconds?: number;
}

export interface OverviewStats {
  total_users: number;
  total_books: number;
  total_reading_sessions: number;
  total_reading_time_hours: number;
  active_readers_today: number;
  active_readers_week: number;
  most_popular_book?: BookStats;
}

export interface BookStats {
  book_id: number;
  title: string;
  cover_url?: string;
  total_readers: number;
  total_sessions: number;
  total_reading_time_hours: number;
  average_pages_read: number;
}

export interface ReaderActivity {
  user_id: number;
  user_name: string;
  email: string;
  books_read: number;
  total_reading_time_hours: number;
  last_active: string;
}

export const analyticsService = {
  // Start reading session
  async startSession(data: ReadingSessionCreate): Promise<ReadingSession> {
    const response = await api.post<ReadingSession>(
      "/analytics/reading/start",
      data
    );
    return response.data;
  },

  // Update reading progress
  async updateProgress(
    sessionId: number,
    data: ReadingSessionUpdate
  ): Promise<ReadingSession> {
    const response = await api.put<ReadingSession>(
      `/analytics/reading/${sessionId}/update`,
      data
    );
    return response.data;
  },

  // End reading session
  async endSession(sessionId: number): Promise<ReadingSession> {
    const response = await api.post<ReadingSession>(
      `/analytics/reading/${sessionId}/end`
    );
    return response.data;
  },

  // Admin: Get overview stats
  async getOverviewStats(): Promise<OverviewStats> {
    const response = await api.get<OverviewStats>(
      "/analytics/admin/analytics/overview"
    );
    return response.data;
  },

  // Admin: Get book statistics
  async getBookStats(): Promise<BookStats[]> {
    const response = await api.get<BookStats[]>(
      "/analytics/admin/analytics/books"
    );
    return response.data;
  },

  // Admin: Get reader activity
  async getReaderActivity(limit: number = 20): Promise<ReaderActivity[]> {
    const response = await api.get<ReaderActivity[]>(
      "/analytics/admin/analytics/readers",
      { params: { limit } }
    );
    return response.data;
  },
};

