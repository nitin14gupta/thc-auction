import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register — HYPE.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Join The Drop"
      title="Own What Others Chase."
      subtitle="Create an account to bid on authentic sneakers, streetwear, and more — live."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
