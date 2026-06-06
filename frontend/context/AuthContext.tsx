"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: { email: string; username?: string } | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage for immediate persistence during restarts
  const [user, setUser] = useState<{ email: string; username?: string } | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      try {
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com";
          const res = await fetch(`${apiBase}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          } else if (res.status === 401) {
            // Token is definitely invalid/expired
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (err) {
          console.warn("Auth check: Backend not reachable yet. Keeping existing session if available.");
          // We don't call setUser(null) here to allow the user to remain "logged in" 
          // while the backend is restarting, as long as we have a saved user.
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      const publicPaths = ["/", "/login", "/signup"];
      if (!user && !publicPaths.includes(pathname)) {
        router.push("/login");
      } else if (user && (pathname === "/login" || pathname === "/signup")) {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    // Refresh and persist user data
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://krysha-rag-backend.onrender.com"}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch user data");
      })
      .then((userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        router.push("/");
      })
      .catch((err) => {
        console.error("Login follow-up error:", err);
        // Fallback: at least redirect if we have a token
        router.push("/");
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Use window.location.href to force a complete state reset and return to the root
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
