"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { submitContactForm, type ContactPayload } from "@/api/contactApi";

const ROLE_OPTIONS = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "media", label: "Media / Press" },
  { value: "other", label: "Other" },
];

type FormState = ContactPayload;
type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  fullName: "",
  email: "",
  role: "",
  subject: "",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name: keyof FormState, value: string): string {
  switch (name) {
    case "fullName":
      if (!value.trim()) return "Full name is required.";
      if (value.trim().length < 2) return "Enter at least 2 characters.";
      return "";
    case "email":
      if (!value.trim()) return "Email address is required.";
      if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
      return "";
    case "role":
      if (!value) return "Please select an option.";
      return "";
    case "subject":
      if (!value.trim()) return "Subject is required.";
      if (value.trim().length < 3) return "Subject must be at least 3 characters.";
      return "";
    case "message":
      if (!value.trim()) return "Message is required.";
      if (value.trim().length < 10) return "Message must be at least 10 characters.";
      return "";
    default:
      return "";
  }
}

function validateAll(form: FormState): FieldErrors {
  return (Object.keys(form) as (keyof FormState)[]).reduce<FieldErrors>((acc, key) => {
    const err = validateField(key, form[key]);
    if (err) acc[key] = err;
    return acc;
  }, {});
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [apiError, setApiError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error as soon as the field becomes valid while already touched
    if (touched[name as keyof FormState]) {
      const err = validateField(name as keyof FormState, value);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  }

  function handleBlur(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name as keyof FormState, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setApiError(null);

    // Touch all fields and run full validation
    const allTouched = (Object.keys(EMPTY_FORM) as (keyof FormState)[]).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormState, boolean>
    );
    setTouched(allTouched);

    const errors = validateAll(form);
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setStatus("loading");
    try {
      await submitContactForm(form);
      setStatus("success");
      setForm(EMPTY_FORM);
      setTouched({});
      setFieldErrors({});
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setApiError(msg);
      setStatus("error");
    }
  }

  // Helper: returns error string only if the field has been touched
  function visibleError(name: keyof FormState): string {
    return touched[name] ? (fieldErrors[name] ?? "") : "";
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />

      {/* Hero */}
      <section className="bg-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-screen-xl">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-none tracking-tight text-paper md:text-7xl lg:text-8xl">
            Get in touch.
          </h1>
          <p className="mt-4 font-[family-name:var(--font-barlow)] text-sm tracking-wide text-gray-on-dark md:text-base">
            We respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="flex-1 bg-sand px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-screen-xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">

            {/* Image */}
            <div className="relative hidden min-h-[520px] w-full overflow-hidden rounded-xl lg:block">
              <Image
                src="https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?auto=format&fit=crop&w=1200&q=80"
                alt="Customer support representative on a call"
                fill
                className="object-cover"
                sizes="50vw"
                unoptimized
              />
            </div>

            {/* Form */}
            <div>
              {status === "success" ? (
                <div className="flex flex-col items-start gap-4 rounded-sm border border-ink-on-sand/20 bg-tan p-8">
                  <CheckCircleIcon className="h-8 w-8 text-ink-on-sand" />
                  <p className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase text-ink-on-sand">
                    Message sent.
                  </p>
                  <p className="font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-2 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand underline underline-offset-2 hover:text-gold"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="fullName"
                      className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand"
                    >
                      Full Name <span className="text-red-urgent">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={form.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-describedby={visibleError("fullName") ? "fullName-error" : undefined}
                      aria-invalid={!!visibleError("fullName")}
                      className={`h-11 w-full rounded-sm border bg-tan px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand/60 focus:outline-none ${
                        visibleError("fullName")
                          ? "border-red-urgent focus:border-red-urgent"
                          : "border-ink-on-sand/25 focus:border-ink-on-sand/60"
                      }`}
                    />
                    {visibleError("fullName") && (
                      <p id="fullName-error" role="alert" className="font-[family-name:var(--font-barlow)] text-xs text-red-urgent">
                        {visibleError("fullName")}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand"
                    >
                      Email Address <span className="text-red-urgent">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-describedby={visibleError("email") ? "email-error" : undefined}
                      aria-invalid={!!visibleError("email")}
                      className={`h-11 w-full rounded-sm border bg-tan px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand/60 focus:outline-none ${
                        visibleError("email")
                          ? "border-red-urgent focus:border-red-urgent"
                          : "border-ink-on-sand/25 focus:border-ink-on-sand/60"
                      }`}
                    />
                    {visibleError("email") && (
                      <p id="email-error" role="alert" className="font-[family-name:var(--font-barlow)] text-xs text-red-urgent">
                        {visibleError("email")}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="role"
                      className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand"
                    >
                      I am a <span className="text-red-urgent">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        aria-describedby={visibleError("role") ? "role-error" : undefined}
                        aria-invalid={!!visibleError("role")}
                        className={`h-11 w-full appearance-none rounded-sm border bg-tan px-3 pr-9 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand focus:outline-none ${
                          visibleError("role")
                            ? "border-red-urgent focus:border-red-urgent"
                            : "border-ink-on-sand/25 focus:border-ink-on-sand/60"
                        }`}
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-on-sand" />
                    </div>
                    {visibleError("role") && (
                      <p id="role-error" role="alert" className="font-[family-name:var(--font-barlow)] text-xs text-red-urgent">
                        {visibleError("role")}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="subject"
                      className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand"
                    >
                      Subject <span className="text-red-urgent">*</span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-describedby={visibleError("subject") ? "subject-error" : undefined}
                      aria-invalid={!!visibleError("subject")}
                      className={`h-11 w-full rounded-sm border bg-tan px-3 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand/60 focus:outline-none ${
                        visibleError("subject")
                          ? "border-red-urgent focus:border-red-urgent"
                          : "border-ink-on-sand/25 focus:border-ink-on-sand/60"
                      }`}
                    />
                    {visibleError("subject") && (
                      <p id="subject-error" role="alert" className="font-[family-name:var(--font-barlow)] text-xs text-red-urgent">
                        {visibleError("subject")}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="message"
                      className="font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand"
                    >
                      Message <span className="text-red-urgent">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-describedby={visibleError("message") ? "message-error" : undefined}
                      aria-invalid={!!visibleError("message")}
                      className={`w-full resize-y rounded-sm border bg-tan px-3 py-2.5 font-[family-name:var(--font-barlow)] text-sm text-ink-on-sand placeholder:text-muted-on-sand/60 focus:outline-none ${
                        visibleError("message")
                          ? "border-red-urgent focus:border-red-urgent"
                          : "border-ink-on-sand/25 focus:border-ink-on-sand/60"
                      }`}
                    />
                    {visibleError("message") && (
                      <p id="message-error" role="alert" className="font-[family-name:var(--font-barlow)] text-xs text-red-urgent">
                        {visibleError("message")}
                      </p>
                    )}
                  </div>

                  {/* API / network error */}
                  {status === "error" && apiError && (
                    <p
                      role="alert"
                      className="font-[family-name:var(--font-barlow)] text-sm text-red-urgent"
                    >
                      {apiError}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-sm bg-ink px-8 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "loading" ? "Sending…" : "Send Message"}
                  </button>

                  {/* Help text */}
                  <div className="flex flex-col gap-2 border-t border-ink-on-sand/15 pt-5">
                    <p className="font-[family-name:var(--font-barlow)] text-sm leading-relaxed text-muted-on-sand">
                      For seller applications, visit the{" "}
                      <Link
                        href="/sell-with-us"
                        className="border-b border-ink-on-sand/40 font-medium text-ink-on-sand hover:border-gold hover:text-gold"
                      >
                        Sell With Us
                      </Link>{" "}
                      page.
                    </p>
                    <p className="font-[family-name:var(--font-barlow)] text-sm leading-relaxed text-muted-on-sand">
                      For order or shipment issues, log in to your dashboard and raise a ticket directly.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 12 3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
