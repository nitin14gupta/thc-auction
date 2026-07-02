import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordFlow } from "@/components/auth/ForgotPasswordFlow";

export const metadata: Metadata = {
  title: "Forgot Password — HYPE.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Bid. Win. Repeat."
      subtitle="Verify your email and set a new password to get back into your account."
    >
      <ForgotPasswordFlow />
    </AuthLayout>
  );
}
