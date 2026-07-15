import { apiRequest } from "@/api/apiService";
import type { MessageResponse } from "@/types/auth";

export function subscribeToNewsletter(email: string) {
  return apiRequest<MessageResponse>("/newsletter/subscribe", {
    method: "POST",
    body: { email },
  });
}
