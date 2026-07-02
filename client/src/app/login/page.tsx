import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — HYPE.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome Back"
      title="Bid. Win. Repeat."
      subtitle="Sign in to track your live auctions and pick up right where you left off."
    >
      <LoginForm />
    </AuthLayout>
  );
}
