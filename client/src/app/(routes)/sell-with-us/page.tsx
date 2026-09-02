import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ─── Section 1 · Hero ────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative bg-[#0a0a0a] px-6 py-24 md:px-10 md:py-36 lg:py-48">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/images/about-hero.webp)" }}
      />
      <div className="relative z-10">
        <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-[0.2em] text-gray-on-dark">
          Sell With HYPE.
        </p>
        <h1 className="mt-6 font-[family-name:var(--font-barlow-condensed)] text-6xl font-extrabold uppercase leading-none tracking-tight text-paper md:text-8xl lg:text-[112px]">
          Let The Market
          <br />
          Pay You.
        </h1>
        <p className="mt-6 max-w-lg font-[family-name:var(--font-barlow)] text-base tracking-wide text-gray-on-dark md:text-lg">
          List in minutes. Real buyers bid it up in real time. No lowball offers, no haggling.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
          <Link
            href="/dashboard/create-listing"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-paper px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink transition-opacity hover:opacity-80"
          >
            Start Selling
          </Link>
          <Link
            href="/live"
            className="inline-flex h-12 items-center justify-center rounded-sm border border-paper/40 px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper/5"
          >
            See Live Auctions
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2 · The Pitch ────────────────────────────────────────────────────

function PitchSection() {
  return (
    <section className="bg-tan px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col md:flex-row md:items-stretch">
          <div className="flex shrink-0 items-center justify-start pb-10 md:w-[300px] md:pb-0 md:pr-12 lg:w-[420px] lg:pr-16">
            <h2 className="break-words font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-[0.92] text-ink-on-sand md:text-6xl lg:text-7xl xl:text-8xl">
              Stop
              <br />
              Guessing
            </h2>
          </div>

          <div className="h-px w-full bg-ink-on-sand/20 md:h-auto md:w-px md:shrink-0 md:self-stretch md:bg-ink-on-sand/25" />

          <div className="flex flex-col justify-center gap-7 pt-10 md:pl-12 md:pt-0 lg:pl-16">
            <p className="font-[family-name:var(--font-barlow)] text-lg leading-relaxed text-ink-on-sand/80 md:text-xl lg:text-2xl">
              Sell it yourself and you spend weeks fielding lowball DMs. Hand it to a
              consignment store and they set the price — usually in their favor, not yours.
              Either way, you never really know what your item is worth.
            </p>

            <p className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold uppercase text-ink-on-sand md:text-4xl lg:text-5xl">
              On HYPE., the buyers decide the price. Not us. Not you.
            </p>

            <p className="font-[family-name:var(--font-barlow)] text-lg leading-relaxed text-ink-on-sand/80 md:text-xl lg:text-2xl">
              List your item, we authenticate it, and it goes live to a market of real bidders
              competing for it in real time. The final bid is the true market price — every time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 3 · How Selling Works ────────────────────────────────────────────

const SELLER_STEPS = [
  {
    label: "Step One",
    headline: "List Your Item.",
    description: "Search our catalog, add condition & photos, and set your starting bid. Takes minutes.",
  },
  {
    label: "Step Two",
    headline: "The Market Bids It Up.",
    description: "Your listing goes live and real buyers compete for it — watch the price climb in real time.",
  },
  {
    label: "Step Three",
    headline: "We Handle The Rest.",
    description: "The winning buyer pays, we authenticate & ship, and your payout lands once delivery is confirmed.",
  },
];

function HowItWorksSection() {
  return (
    <section className="bg-[#0a0a0a] px-6 py-24 md:px-10 md:py-32 lg:py-40">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-16 md:mb-20">
          <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-on-dark">
            How Selling Works
          </p>
          <div className="mt-3 h-px w-8 bg-paper/20" />
          <h2 className="mt-8 font-[family-name:var(--font-barlow-condensed)] text-6xl font-extrabold uppercase leading-[0.9] tracking-tight text-paper md:text-7xl lg:text-8xl">
            List It.
            <br />
            Get Paid.
          </h2>
          <p className="mt-6 max-w-md font-[family-name:var(--font-barlow)] text-base leading-relaxed text-gray-on-dark md:text-lg">
            Three steps between your closet and a real payout.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {SELLER_STEPS.map((step) => (
            <div
              key={step.label}
              className="group flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#111111] p-8 transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:border-white/20 hover:bg-[#161616] md:p-10"
            >
              <div className="h-px w-8 bg-paper/30 transition-all duration-[250ms] group-hover:w-14 group-hover:bg-paper/60" />

              <p className="font-[family-name:var(--font-barlow)] text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-on-dark">
                {step.label}
              </p>

              <h3 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold uppercase leading-tight text-paper md:text-4xl">
                {step.headline}
              </h3>

              <div className="h-px w-full bg-white/[0.07]" />

              <div className="flex items-end justify-between gap-4">
                <p className="font-[family-name:var(--font-barlow)] text-base leading-relaxed text-gray-on-dark md:text-lg">
                  {step.description}
                </p>
                <ArrowIcon className="h-5 w-5 shrink-0 translate-x-0 translate-y-0 text-paper/0 transition-all duration-[250ms] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-paper/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 4 · Why Sellers Choose HYPE ──────────────────────────────────────

const SELLER_BENEFITS = [
  {
    num: "01",
    title: "Live Market Pricing",
    body: "No fixed asking price to negotiate down. Real bidders compete for your item and the highest bid wins — full stop.",
  },
  {
    num: "02",
    title: "Low, Flat Commission",
    body: "8% on sales under ₹50,000, 10% at or above. No hidden listing fees, no surprise deductions.",
  },
  {
    num: "03",
    title: "Zero Buyer Contact",
    body: "Our logistics partner handles pickup and delivery end to end. You never deal with a stranger's DMs or a meetup.",
  },
  {
    num: "04",
    title: "Buyer Trust Built In",
    body: "Every item is authenticated before it reaches the buyer, which means serious bidders and fewer flaky sales.",
  },
];

function BenefitsSection() {
  return (
    <section className="bg-tan px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-20 md:mb-24">
          <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-on-sand">
            Why Sellers Choose HYPE.
          </p>
          <div className="mt-3 h-px w-8 bg-ink-on-sand/30" />
          <h2 className="mt-8 font-[family-name:var(--font-barlow-condensed)] text-6xl font-extrabold uppercase leading-[0.9] tracking-tight text-ink-on-sand md:text-7xl lg:text-8xl">
            Built To Get
            <br />
            You Paid Fairly.
          </h2>
          <p className="mt-6 max-w-lg font-[family-name:var(--font-barlow)] text-base leading-relaxed text-muted-on-sand md:text-lg">
            No lowballing, no haggling, no guessing what your item is really worth.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {SELLER_BENEFITS.map((item) => (
            <article
              key={item.num}
              className="group relative flex flex-col gap-6 rounded-xl border border-ink-on-sand/12 bg-paper p-8 transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:border-ink-on-sand/30 md:p-10"
            >
              <span className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-bold leading-none text-ink-on-sand/10 md:text-6xl">
                {item.num}
              </span>

              <h3 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold uppercase leading-tight text-ink-on-sand md:text-4xl">
                {item.title}
              </h3>

              <div className="flex items-end justify-between gap-6">
                <p className="w-[90%] font-[family-name:var(--font-barlow)] text-base leading-relaxed text-muted-on-sand md:text-lg">
                  {item.body}
                </p>
                <ArrowIcon className="h-5 w-5 shrink-0 translate-x-0 text-ink-on-sand/30 transition-all duration-[250ms] ease-out group-hover:translate-x-2 group-hover:text-ink-on-sand/70" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 5 · CTA Strip ────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="bg-[#0a0a0a] px-6 py-20 md:px-10">
      <div className="mx-auto flex flex-col items-center gap-8 text-center">
        <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-widest text-gray-on-dark">
          Ready When You Are
        </p>
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold uppercase text-paper md:text-6xl">
          Your First Listing Takes Minutes.
        </h2>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/dashboard/create-listing"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-paper px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink transition-opacity hover:opacity-80"
          >
            Start Selling
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-sm border border-paper/40 px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper/5"
          >
            Have Questions?
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SellWithUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PitchSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
