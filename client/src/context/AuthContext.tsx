"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loginRequest, logoutRequest, refreshRequest, registerRequest } from "@/api/authApi";
import { apiRequest } from "@/api/apiService";
import { ApiError, type User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;
  updateUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);
  accessTokenRef.current = accessToken;

  const attemptRefresh = useCallback(async () => {
    try {
      const data = await refreshRequest();
      setUser(data.user);
      setAccessToken(data.access_token);
      return data.access_token;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    attemptRefresh().finally(() => setIsLoading(false));
  }, [attemptRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setUser(data.user);
    setAccessToken(data.access_token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await registerRequest(name, email, password);
    setUser(data.user);
    setAccessToken(data.access_token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const authFetch = useCallback(
    async <T,>(path: string, options: Omit<Parameters<typeof apiRequest>[1], "accessToken"> = {}) => {
      try {
        return await apiRequest<T>(path, { ...options, accessToken: accessTokenRef.current });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshedToken = await attemptRefresh();
          if (refreshedToken) {
            return apiRequest<T>(path, { ...options, accessToken: refreshedToken });
          }
        }
        throw error;
      }
    },
    [attemptRefresh]
  );

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      authFetch,
      updateUser,
    }),
    [user, accessToken, isLoading, login, register, logout, authFetch, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
