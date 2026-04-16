"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_KEY = "hena_user";

function getCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && parsed.email) return parsed as User;
  } catch { /* corrupted cache */ }
  return null;
}

function setCachedUser(user: User | null) {
  try {
    if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* storage full or blocked */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Hydrate instantly from cache — no loading spinner on repeat visits
  const [user, setUser] = useState<User | null>(getCachedUser);
  const [loading, setLoading] = useState(() => !getCachedUser());
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      setCachedUser(data);
    } catch {
      setUser(null);
      setCachedUser(null);
    }
  }, []);

  useEffect(() => {
    // If we had a cached user, we're already "not loading" — just
    // revalidate in the background to keep data fresh.
    const cached = getCachedUser();
    if (cached) {
      setLoading(false);
      refreshUser();
    } else {
      refreshUser().finally(() => setLoading(false));
    }
  }, [refreshUser]);

  const login = async (email: string, password: string, redirectTo?: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    setCachedUser(data.user);
    toast.success("Successfully logged in!");
    router.push(redirectTo || "/");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — cookie will be expired anyway
    }
    setUser(null);
    setCachedUser(null);
    toast.info("Logged out successfully");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
