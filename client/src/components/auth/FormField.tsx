import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FormField({ label, error, id, className = "", ...props }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-[family-name:var(--font-barlow)] text-xs font-medium uppercase tracking-wide text-gray-on-dark"
      >
        {label}
      </label>
      <input
        id={id}
        className={`h-12 w-full rounded-md border bg-transparent px-4 font-[family-name:var(--font-barlow)] text-sm text-paper placeholder:text-gray-on-dark focus:outline-none focus:ring-1 ${
          error
            ? "border-red-urgent focus:ring-red-urgent"
            : "border-white/20 focus:border-tan focus:ring-tan"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 font-[family-name:var(--font-barlow)] text-xs text-red-urgent">{error}</p>
      )}
    </div>
  );
}
