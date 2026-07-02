export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-md border border-red-urgent/40 bg-red-urgent/10 px-4 py-3 font-[family-name:var(--font-barlow)] text-sm text-red-urgent">
      {message}
    </div>
  );
}
