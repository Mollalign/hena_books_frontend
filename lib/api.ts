import axios from "axios";

// API Base URL - uses environment variable or defaults to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // Get the request URL to check if it's a public endpoint check
        const requestUrl = error.config?.url || "";
        
        // Don't redirect for /auth/me - this is expected to fail for guests
        // Don't redirect for public pages (homepage, books listing)
        const isAuthCheck = requestUrl.includes("/auth/me");
        const isPublicPage = ["/", "/books", "/login", "/register"].includes(window.location.pathname) ||
                            window.location.pathname.startsWith("/books/");
        
        // Only clear token and redirect if it's not an auth check on a public page
        if (!isAuthCheck || !isPublicPage) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          
          // Only redirect if on a protected page (admin, reading, etc.)
          const protectedPaths = ["/admin", "/profile"];
          const isProtectedPage = protectedPaths.some(path => window.location.pathname.startsWith(path));
          
          if (isProtectedPage && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Export the base URL for use in other places (like PDF reader)
export const getApiBaseUrl = () => {
  // Remove /api/v1 suffix to get the base server URL
  return API_BASE_URL.replace("/api/v1", "");
};

export default api;
