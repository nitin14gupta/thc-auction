import { API_BASE_URL } from "@/api/config";
import { getCached, setCached } from "@/api/apiCache";
import { ApiError } from "@/types/auth";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  accessToken?: string | null;
  // Set on GET requests to cache the response in memory for this long —
  // repeat calls with the same path + accessToken return the cached value
  // instead of hitting the network. Omit for anything that must always be
  // fresh (live auction data, mutations).
  cacheTtlMs?: number;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, accessToken, headers, cacheTtlMs, ...rest } = options;
  const isFormData = body instanceof FormData;
  const isGet = !rest.method || rest.method === "GET";

  if (isGet && cacheTtlMs) {
    const cached = getCached<T>(path, accessToken);
    if (cached !== undefined) return cached;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "detail" in data && typeof data.detail === "string"
        ? data.detail
        : null) ?? "Something went wrong. Please try again.";
    throw new ApiError(message, response.status);
  }

  if (isGet && cacheTtlMs) {
    setCached(path, accessToken, data, cacheTtlMs);
  }

  return data as T;
}
