"use client";

import { useState, type InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FormField({ label, error, id, className = "", type, ...props }: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-[family-name:var(--font-barlow)] text-xs font-medium uppercase tracking-wide text-gray-on-dark"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`h-12 w-full rounded-md border bg-[#ffffff]/10 px-4 font-[family-name:var(--font-barlow)] text-sm text-paper placeholder:text-gray-on-dark focus:outline-none focus:ring-1 ${
            isPassword ? "pr-11" : ""
          } ${
            error
              ? "border-red-urgent focus:ring-red-urgent"
              : "border-[#aaaaaa]/50 focus:border-tan focus:ring-tan"
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-12 w-11 items-center justify-center text-gray-on-dark transition-colors hover:text-paper"
          >
            {showPassword ? <EyeOffIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 font-[family-name:var(--font-barlow)] text-xs text-red-urgent">{error}</p>
      )}
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.7 6.7C4.3 8.3 2 12 2 12s3.6 7 10 7c1.9 0 3.5-.5 4.9-1.3M9.5 5.2C10.3 5.1 11.1 5 12 5c6.4 0 10 7 10 7-.5.9-1.3 2-2.4 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
