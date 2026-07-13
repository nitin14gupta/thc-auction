import type { apiRequest } from "@/api/apiService";
import type { User } from "@/types/auth";

type AuthFetch = <T>(path: string, options?: Omit<Parameters<typeof apiRequest>[1], "accessToken">) => Promise<T>;

export function uploadAvatar(authFetch: AuthFetch, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return authFetch<User>("/auth/me/avatar", { method: "PATCH", body: formData });
}
