import { Container } from "@/components/ui/Container";

export function Newsletter() {
  return (
    <section className="border-b border-white/10 bg-ink py-14">
      <Container className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-paper sm:text-4xl">
            Stay Ahead of the Drop.
          </h2>
          <p className="mt-2 font-[family-name:var(--font-barlow)] text-base text-gray-on-dark">
            Get updates on exclusive drops and live auctions.
          </p>
        </div>

        <form className="flex w-full max-w-lg overflow-hidden rounded-md border border-white/20">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="Enter your email"
            className="h-14 flex-1 bg-transparent px-5 font-[family-name:var(--font-barlow)] text-sm text-paper placeholder:text-gray-on-dark focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Subscribe"
            className="flex w-16 items-center justify-center bg-tan text-ink-on-sand transition-colors hover:bg-tan/80"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </form>
      </Container>
    </section>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
