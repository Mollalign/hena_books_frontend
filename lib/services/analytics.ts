import api from "@/lib/api";

export interface ReadingSession {
  id: string | number;
  user_id: string;
  book_id: string;
  started_at: string;
  ended_at?: string;
  last_page_read: number;
  total_time_seconds: number;
}

export interface ReadingSessionCreate {
  book_id: string;
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
  book_id: string;
  title: string;
  cover_url?: string;
  total_readers: number;
  total_sessions: number;
  total_reading_time_hours: number;
  average_pages_read: number;
}

export interface ReaderActivity {
  user_id: string;
  user_name: string;
  email: string;
  books_read: number;
  total_reading_time_hours: number;
  last_active: string;
}

export interface UserReadingStats {
  total_books_read: number;
  total_reading_time_hours: number;
  total_sessions: number;
}

export const analyticsService = {
  // Start reading session
  async startSession(data: ReadingSessionCreate): Promise<ReadingSession> {
    const response = await api.post<ReadingSession>(
      "/reading/start",
      data
    );
    return response.data;
  },

  // Update reading progress
  async updateProgress(
    sessionId: string | number,
    data: ReadingSessionUpdate
  ): Promise<ReadingSession> {
    const response = await api.put<ReadingSession>(
      `/reading/${sessionId}/update`,
      data
    );
    return response.data;
  },

  // End reading session
  async endSession(sessionId: string | number): Promise<ReadingSession> {
    const response = await api.post<ReadingSession>(
      `/reading/${sessionId}/end`
    );
    return response.data;
  },

  // Admin: Get overview stats
  async getOverviewStats(): Promise<OverviewStats> {
    const response = await api.get<OverviewStats>(
      "/admin/analytics/overview"
    );
    return response.data;
  },

  // Admin: Get book statistics
  async getBookStats(): Promise<BookStats[]> {
    const response = await api.get<BookStats[]>(
      "/admin/analytics/books"
    );
    return response.data;
  },

  // Admin: Get reader activity
  async getReaderActivity(limit: number = 20): Promise<ReaderActivity[]> {
    const response = await api.get<ReaderActivity[]>(
      "/admin/analytics/readers",
      { params: { limit } }
    );
    return response.data;
  },

  // Get current user's reading stats
  async getMyReadingStats(): Promise<UserReadingStats> {
    const response = await api.get<UserReadingStats>("/reading/my-stats");
    return response.data;
  },
};

