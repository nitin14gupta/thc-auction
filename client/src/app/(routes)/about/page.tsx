import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ─── Section 1 · Hero ────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative bg-[#0a0a0a] px-6 py-24 md:px-10 md:py-36 lg:py-48">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/images/about-hero.png)" }}
      />
      <div className="relative z-10">
            <p className="font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-[0.2em] text-gray-on-dark">
              About HYPE.
            </p>
        <h1 className="mt-6 font-[family-name:var(--font-barlow-condensed)] text-6xl font-extrabold uppercase leading-none tracking-tight text-paper md:text-8xl lg:text-[112px]">
          The Market
          <br />
          Decides.
        </h1>
        <p className="mt-6 font-[family-name:var(--font-barlow)] text-base tracking-wide text-gray-on-dark md:text-lg">
          India's first live auction marketplace for hype culture.
        </p>
      </div>
    </section>
  );
}

// ─── Section 2 · The Story ────────────────────────────────────────────────────

function StorySection() {
  return (
    <section className="bg-tan px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-col md:flex-row md:items-stretch">

          {/* Left — title */}
          <div className="flex shrink-0 items-center justify-start pb-10 md:w-[300px] md:pb-0 md:pr-12 lg:w-[420px] lg:pr-16">
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-[0.92] text-ink-on-sand md:text-6xl lg:text-7xl xl:text-8xl">
              Why HYPE.
              <br />
              Was Built
            </h2>
          </div>

          {/* Vertical divider */}
          <div className="h-px w-full bg-ink-on-sand/20 md:h-auto md:w-px md:shrink-0 md:self-stretch md:bg-ink-on-sand/25" />

          {/* Right — body */}
          <div className="flex flex-col justify-center gap-7 pt-10 md:pl-12 md:pt-0 lg:pl-16">
            <p className="font-[family-name:var(--font-barlow)] text-lg leading-relaxed text-ink-on-sand/80 md:text-xl lg:text-2xl">
              India's resale market has a problem. Prices are set by whoever shouts the
              loudest — not by what something is actually worth. Fakes are everywhere.
              Transparency is missing. And if you're a buyer, you never really know if
              you're paying the right price.
            </p>

            {/* Pull-quote */}
            <p className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold uppercase text-ink-on-sand md:text-4xl lg:text-5xl">
              HYPE. was built to fix that.
            </p>

            <p className="font-[family-name:var(--font-barlow)] text-lg leading-relaxed text-ink-on-sand/80 md:text-xl lg:text-2xl">
              We built India's first live auction marketplace — where sneakers, streetwear,
              luxury accessories, collectibles, art, and everything the culture values gets
              its true price. Not the price a seller decides. The price the market decides.
              Live. In real time. In front of everyone.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Section 3 · Mission ──────────────────────────────────────────────────────

const MISSION_CARDS = [
  {
    label: "Authenticity",
    headline: "Every Item Authenticated.",
    description:
      "Every product is professionally verified before it reaches the buyer. No exceptions.",
  },
  {
    label: "Market Value",
    headline: "Every Price Set by the Market.",
    description:
      "Live auctions determine the true market value — not arbitrary seller pricing.",
  },
  {
    label: "Transparency",
    headline: "Every Transaction Transparent.",
    description:
      "Every bid, every price, and every sale is visible from start to finish.",
  },
];

function MissionSection() {
  return (
    <section className="bg-[#0a0a0a] px-6 py-24 md:px-10 md:py-32 lg:py-40">
      <div className="mx-auto max-w-screen-xl">

        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-on-dark">
            The Mission
          </p>
          <div className="mt-3 h-px w-8 bg-paper/20" />
          <h2 className="mt-8 font-[family-name:var(--font-barlow-condensed)] text-6xl font-extrabold uppercase leading-[0.9] tracking-tight text-paper md:text-7xl lg:text-8xl">
            Fair Price.
            <br />
            Every Time.
          </h2>
          <p className="mt-6 max-w-md font-[family-name:var(--font-barlow)] text-base leading-relaxed text-gray-on-dark md:text-lg">
            Three principles underpin everything we do at HYPE. — no compromise on any of them.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {MISSION_CARDS.map((card) => (
            <div
              key={card.label}
              className="group flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#111111] p-8 transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:border-white/20 hover:bg-[#161616] md:p-10"
            >
              {/* Top accent line */}
              <div className="h-px w-8 bg-paper/30 transition-all duration-[250ms] group-hover:w-14 group-hover:bg-paper/60" />

              {/* Label */}
              <p className="font-[family-name:var(--font-barlow)] text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-on-dark">
                {card.label}
              </p>

              {/* Headline */}
              <h3 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold uppercase leading-tight text-paper md:text-4xl">
                {card.headline}
              </h3>

              {/* Divider */}
              <div className="h-px w-full bg-white/[0.07]" />

              {/* Description + arrow */}
              <div className="flex items-end justify-between gap-4">
                <p className="font-[family-name:var(--font-barlow)] text-base leading-relaxed text-gray-on-dark md:text-lg">
                  {card.description}
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

// ─── Section 4 · Differentiators ─────────────────────────────────────────────

const DIFFERENTIATORS = [
  {
    num: "01",
    title: "Live Auctions",
    body: "The market determines the true value through live bidding — not fixed seller pricing. Watch bids move in real time and win at a fair value.",
    image: "https://images.unsplash.com/photo-1676181739859-08330dea8999?auto=format&fit=crop&w=900&q=80",
  },
  {
    num: "02",
    title: "End-to-End Logistics",
    body: "Our delivery partner handles every pickup and delivery. No direct contact between buyer and seller. Ever.",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=900&q=80",
  },
  {
    num: "03",
    title: "Authentication on Every Item",
    body: "Every item passes through our authentication centre before it reaches you. If it fails, you get a full refund. No exceptions.",
    image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=900&q=80",
  },
  {
    num: "04",
    title: "Everything the Culture Wants",
    body: "Sneakers. Streetwear. Luxury. Collectibles. Art. Trading cards. If the culture wants it, it's on HYPE.",
    image: "https://images.unsplash.com/photo-1669671943625-e20799ee5f42?auto=format&fit=crop&w=900&q=80",
  },
];

function DifferentiatorsSection() {
  return (
    <section className="bg-tan px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-screen-xl">

        {/* Header */}
        <div className="mb-20 md:mb-24">
          <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-on-sand">
            What Makes HYPE. Different
          </p>
          <div className="mt-3 h-px w-8 bg-ink-on-sand/30" />
          <h2 className="mt-8 font-[family-name:var(--font-barlow-condensed)] text-6xl font-extrabold uppercase leading-[0.9] tracking-tight text-ink-on-sand md:text-7xl lg:text-8xl">
            Not Just
            <br />
            Another
            <br />
            Resale Platform.
          </h2>
          <p className="mt-6 max-w-lg font-[family-name:var(--font-barlow)] text-base leading-relaxed text-muted-on-sand md:text-lg">
            HYPE. combines live market pricing, professional authentication, and end-to-end
            logistics into one seamless platform — built for the culture, by people who live it.
          </p>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item) => (
            <article
              key={item.num}
              className="group relative flex flex-col gap-6 rounded-xl border border-ink-on-sand/12 bg-paper p-8 transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:border-ink-on-sand/30 md:p-10"
            >
              {/* Feature number */}
              <span className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-bold leading-none text-ink-on-sand/10 md:text-6xl">
                {item.num}
              </span>

              {/* 16:9 image */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-sand">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  unoptimized
                />
              </div>

              {/* Title */}
              <h3 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold uppercase leading-tight text-ink-on-sand md:text-4xl">
                {item.title}
              </h3>

              {/* Body + arrow */}
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
          Get Started
        </p>
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold uppercase text-paper md:text-6xl">
          Join HYPE.
        </h2>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/live"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-paper px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink transition-opacity hover:opacity-80"
          >
            Browse Auctions
          </Link>
          <Link
            href="/sell-with-us"
            className="inline-flex h-12 items-center justify-center rounded-sm border border-paper/40 px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper/5"
          >
            Sell With Us
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StorySection />
        <MissionSection />
        <DifferentiatorsSection />
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
