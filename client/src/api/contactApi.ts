import { apiRequest } from "@/api/apiService";
import type { MessageResponse } from "@/types/auth";

export type ContactPayload = {
  fullName: string;
  email: string;
  role: string;
  subject: string;
  message: string;
};

export function submitContactForm(payload: ContactPayload) {
  return apiRequest<MessageResponse>("/contact", {
    method: "POST",
    body: payload,
  });
}
