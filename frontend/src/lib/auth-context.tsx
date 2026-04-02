"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "./api";

interface StaffUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "manager" | "regular";
  companyId: number;
  companyName?: string;
  companySubdomain?: string;
}

interface AuthContextType {
  user: StaffUser | null;
  loading: boolean;
  login: (email: string, password: string, subdomain: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("staff_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: StaffUser }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("staff_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, subdomain: string) => {
    const data = await api.post<{ token: string; staff: StaffUser }>(
      "/auth/staff/login",
      { email, password, subdomain }
    );
    localStorage.setItem("staff_token", data.token);
    setUser(data.staff);
  };

  const logout = () => {
    localStorage.removeItem("staff_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
