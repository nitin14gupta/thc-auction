"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/auth/FormError";
import { FormField } from "@/components/auth/FormField";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast("Welcome back!", "success");
      router.push("/");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-paper">
        Sign In
      </h1>
      <p className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
        Welcome back. Log in to keep bidding.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <FormError message={error} />

        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <div>
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Link
            href="/forgot-password"
            className="mt-2 inline-block font-[family-name:var(--font-barlow)] text-xs font-medium text-tan hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="solid-tan" disabled={isSubmitting} className="mt-2 h-12 w-full">
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-tan hover:underline">
          Register
        </Link>
      </p>
    </>
  );
}
