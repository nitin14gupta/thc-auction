"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/auth/FormError";
import { FormField } from "@/components/auth/FormField";
import { forgotPasswordRequest, resetPasswordRequest, verifyOtpRequest } from "@/api/authApi";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/types/auth";

type Step = "email" | "otp" | "reset";

const stepIndex: Record<Step, number> = { email: 1, otp: 2, reset: 3 };

export function ForgotPasswordFlow() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSendCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      toast("Reset code sent to your email.", "success");
      setStep("otp");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await verifyOtpRequest(email, otp);
      setResetToken(data.reset_token);
      setStep("reset");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordRequest(resetToken, newPassword);
      toast("Password updated. Sign in with your new password.", "success");
      router.push("/login");
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
      <div className="mb-6 flex items-center gap-2">
        {(["email", "otp", "reset"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full font-[family-name:var(--font-barlow)] text-[11px] font-semibold ${
                stepIndex[step] >= stepIndex[s] ? "bg-tan text-ink-on-sand" : "bg-white/10 text-gray-on-dark"
              }`}
            >
              {i + 1}
            </span>
            {i < 2 && <span className="h-px w-6 bg-white/15" />}
          </div>
        ))}
      </div>

      {step === "email" && (
        <>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-paper">
            Forgot Password
          </h1>
          <p className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
            Enter your email and we&apos;ll send you a reset code.
          </p>

          <form onSubmit={handleSendCode} className="mt-8 flex flex-col gap-5">
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
            <Button type="submit" variant="solid-tan" disabled={isSubmitting} className="mt-2 h-12 w-full">
              {isSubmitting ? "Sending Code..." : "Send Code"}
            </Button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-paper">
            Enter Code
          </h1>
          <p className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
            We sent a 6-digit code to <span className="text-paper">{email}</span>.
          </p>

          <form onSubmit={handleVerifyOtp} className="mt-8 flex flex-col gap-5">
            <FormError message={error} />
            <FormField
              id="otp"
              label="Verification Code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="tracking-[0.5em]"
            />
            <Button type="submit" variant="solid-tan" disabled={isSubmitting} className="mt-2 h-12 w-full">
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="font-[family-name:var(--font-barlow)] text-xs font-medium text-gray-on-dark hover:text-paper"
            >
              Use a different email
            </button>
          </form>
        </>
      )}

      {step === "reset" && (
        <>
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-paper">
            New Password
          </h1>
          <p className="mt-2 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
            Choose a new password for your account.
          </p>

          <form onSubmit={handleResetPassword} className="mt-8 flex flex-col gap-5">
            <FormError message={error} />
            <FormField
              id="new-password"
              label="New Password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <FormField
              id="confirm-password"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" variant="solid-tan" disabled={isSubmitting} className="mt-2 h-12 w-full">
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </>
      )}

      <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-tan hover:underline">
          Sign In
        </Link>
      </p>
    </>
  );
}
