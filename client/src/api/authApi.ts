import { apiRequest } from "@/api/apiService";
import type { AccessTokenResponse, MessageResponse, User, VerifyOtpResponse } from "@/types/auth";

export function registerRequest(name: string, email: string, password: string) {
  return apiRequest<AccessTokenResponse>("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AccessTokenResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function refreshRequest() {
  return apiRequest<AccessTokenResponse>("/auth/refresh", { method: "POST" });
}

export function logoutRequest() {
  return apiRequest<MessageResponse>("/auth/logout", { method: "POST" });
}

export function meRequest(accessToken: string) {
  return apiRequest<User>("/auth/me", { method: "GET", accessToken });
}

export function forgotPasswordRequest(email: string) {
  return apiRequest<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function verifyOtpRequest(email: string, otp: string) {
  return apiRequest<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });
}

export function resetPasswordRequest(resetToken: string, newPassword: string) {
  return apiRequest<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: { reset_token: resetToken, new_password: newPassword },
  });
}
