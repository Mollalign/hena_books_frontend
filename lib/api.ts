import axios from "axios";

const API_BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        const requestUrl = error.config?.url || "";

        const isAuthCheck = requestUrl.includes("/auth/me");
        const isPublicPage =
          ["/", "/books", "/login", "/register"].includes(
            window.location.pathname
          ) || window.location.pathname.startsWith("/books/");

        if (!isAuthCheck || !isPublicPage) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");

          const protectedPaths = ["/admin", "/profile"];
          const isProtectedPage = protectedPaths.some((path) =>
            window.location.pathname.startsWith(path)
          );

          if (isProtectedPage && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getApiBaseUrl = () => "";

export default api;
