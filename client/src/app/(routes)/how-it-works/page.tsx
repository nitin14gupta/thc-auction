import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const BUYING_STEPS = [
  {
    label: "Step One",
    headline: "Browse Live Auctions.",
    description: "Filter by brand, size, condition, and price. Every listing shows the current price, bid count, and time left.",
  },
  {
    label: "Step Two",
    headline: "Place Your Bid.",
    description: "Bid at or above the minimum next bid. Every new bid extends the closing window, so no one can snipe it at the last second without you getting a chance to respond.",
  },
  {
    label: "Step Three",
    headline: "Win, Pay, Receive.",
    description: "Highest bid wins. Complete payment within the checkout window, and the item goes through authentication before it ships to you.",
  },
];

const SELLING_STEPS = [
  {
    label: "Step One",
    headline: "List Your Item.",
    description: "Search our catalog, add condition and photos, and set your starting bid. Takes minutes.",
  },
  {
    label: "Step Two",
    headline: "The Market Bids It Up.",
    description: "Once accepted, your listing goes live and real buyers compete for it — watch the price climb in real time.",
  },
  {
    label: "Step Three",
    headline: "Get Paid.",
    description: "The winning buyer pays, we authenticate and ship, and your payout lands once delivery is confirmed.",
  },
];

function StepsGrid({ steps }: { steps: typeof BUYING_STEPS }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {steps.map((step) => (
        <div
          key={step.label}
          className="flex flex-col gap-5 rounded-2xl border border-ink-on-sand/12 bg-paper p-8 transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:border-ink-on-sand/30"
        >
          <div className="h-px w-8 bg-ink-on-sand/30" />
          <p className="font-[family-name:var(--font-barlow)] text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-on-sand">
            {step.label}
          </p>
          <h3 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase leading-tight text-ink-on-sand md:text-3xl">
            {step.headline}
          </h3>
          <p className="font-[family-name:var(--font-barlow)] text-sm leading-relaxed text-muted-on-sand">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />

      {/* Hero */}
      <section className="bg-ink px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-screen-xl">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-none tracking-tight text-paper md:text-7xl lg:text-8xl">
            How It Works.
          </h1>
          <p className="mt-4 max-w-xl font-[family-name:var(--font-barlow)] text-sm tracking-wide text-gray-on-dark md:text-base">
            Live market pricing, authenticated every time — whether you&apos;re buying or selling.
          </p>
        </div>
      </section>

      <main className="flex-1 bg-sand px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-screen-xl">
          {/* Buying */}
          <div className="mb-10">
            <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-on-sand">
              For Buyers
            </p>
            <div className="mt-3 h-px w-8 bg-ink-on-sand/30" />
            <h2 className="mt-6 font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold uppercase leading-[0.9] tracking-tight text-ink-on-sand md:text-5xl">
              Bid It. Win It.
            </h2>
          </div>
          <StepsGrid steps={BUYING_STEPS} />

          {/* Selling */}
          <div className="mb-10 mt-20">
            <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-on-sand">
              For Sellers
            </p>
            <div className="mt-3 h-px w-8 bg-ink-on-sand/30" />
            <h2 className="mt-6 font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold uppercase leading-[0.9] tracking-tight text-ink-on-sand md:text-5xl">
              List It. Get Paid.
            </h2>
          </div>
          <StepsGrid steps={SELLING_STEPS} />

          {/* CTA */}
          <div className="mt-20 flex flex-col items-start gap-4 border-t border-ink-on-sand/10 pt-12 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase text-ink-on-sand md:text-3xl">
              Ready to jump in?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/live"
                className="inline-flex h-11 items-center justify-center rounded-sm bg-ink px-8 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-opacity hover:opacity-80"
              >
                Browse Auctions
              </Link>
              <Link
                href="/sell-with-us"
                className="inline-flex h-11 items-center justify-center rounded-sm border border-ink-on-sand/30 px-8 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink-on-sand transition-colors hover:border-ink-on-sand/60"
              >
                Sell With Us
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
