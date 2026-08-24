"use client";

import { useRef } from "react";
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
          Careers at HYPE.
        </p>
        <h1 className="mt-6 font-[family-name:var(--font-barlow-condensed)] text-6xl font-extrabold uppercase leading-none tracking-tight text-paper md:text-8xl lg:text-[112px]">
          Build The
          <br />
          Future Of Resale.
        </h1>
        <p className="mt-6 max-w-lg font-[family-name:var(--font-barlow)] text-base tracking-wide text-gray-on-dark md:text-lg">
          We&apos;re a small team obsessed with sneakers, streetwear, and building a market that
          actually works for both sides of the trade.
        </p>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-paper px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-ink transition-opacity hover:opacity-80"
          >
            Get In Touch
          </Link>
          <Link
            href="/about"
            className="inline-flex h-12 items-center justify-center rounded-sm border border-paper/40 px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-colors hover:border-paper hover:bg-paper/5"
          >
            About HYPE.
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2 · Values ───────────────────────────────────────────────────────

const VALUES = [
  { num: "01", title: "Move Fast", body: "We ship, we test with real users, we iterate. Perfect is the enemy of live." },
  { num: "02", title: "Own It", body: "Small team, real ownership. What you build is what you're accountable for." },
  { num: "03", title: "Culture First", body: "We're building this for people who actually live and breathe the culture — starting with us." },
];

function ValuesSection() {
  return (
    <section className="bg-tan px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-14 md:mb-16">
          <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-on-sand">
            How We Work
          </p>
          <div className="mt-3 h-px w-8 bg-ink-on-sand/30" />
          <h2 className="mt-8 font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-ink-on-sand md:text-6xl">
            What We Value.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.num} className="flex flex-col gap-3">
              <span className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-bold text-ink-on-sand/20">
                {v.num}
              </span>
              <h3 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase text-ink-on-sand">
                {v.title}
              </h3>
              <p className="font-[family-name:var(--font-barlow)] text-sm leading-relaxed text-muted-on-sand">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3 · Life at HYPE — horizontal image slider ──────────────────────

const LIFE_AT_HYPE = [
  { src: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&w=1000&q=80", caption: "Weekly team syncs, no fluff." },
  { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80", caption: "Heads down, building." },
  { src: "https://images.unsplash.com/photo-1644308925079-2cfda5debc53?auto=format&fit=crop&w=1000&q=80", caption: "Where every item gets authenticated." },
  { src: "https://images.unsplash.com/photo-1620388640785-892616248ec8?auto=format&fit=crop&w=1000&q=80", caption: "Logistics that never sleep." },
  { src: "https://images.unsplash.com/photo-1758691737584-a8f17fb34475?auto=format&fit=crop&w=1000&q=80", caption: "Wins get celebrated." },
];

function LifeAtHypeSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <section className="overflow-hidden bg-[#0a0a0a] py-20 md:py-28">
      <div className="mx-auto max-w-screen-xl px-6 md:px-10">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <div>
            <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-on-dark">
              Behind The Scenes
            </p>
            <div className="mt-3 h-px w-8 bg-paper/20" />
            <h2 className="mt-8 font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-paper md:text-6xl">
              Life At HYPE.
            </h2>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Scroll left"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/20 text-paper transition-colors hover:border-paper/50 hover:bg-paper/5"
            >
              <ChevronIcon className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Scroll right"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/20 text-paper transition-colors hover:border-paper/50 hover:bg-paper/5"
            >
              <ChevronIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {LIFE_AT_HYPE.map((item, i) => (
          <div
            key={i}
            data-card
            className="group relative aspect-[4/5] w-[78vw] shrink-0 snap-center overflow-hidden rounded-xl sm:w-[42vw] md:w-[30vw] lg:w-[22vw]"
          >
            <Image
              src={item.src}
              alt={item.caption}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 35vw, 22vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
            <p className="absolute bottom-4 left-4 right-4 font-[family-name:var(--font-barlow)] text-sm font-medium text-paper">
              {item.caption}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section 4 · Open Roles ────────────────────────────────────────────────────

function OpenRolesSection() {
  return (
    <section className="bg-sand px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-screen-xl">
        <p className="font-[family-name:var(--font-barlow)] text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-on-sand">
          Open Roles
        </p>
        <div className="mt-3 h-px w-8 bg-ink-on-sand/30" />
        <h2 className="mt-8 font-[family-name:var(--font-barlow-condensed)] text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-ink-on-sand md:text-6xl">
          Nothing Open Right Now.
        </h2>
        <p className="mt-6 max-w-lg font-[family-name:var(--font-barlow)] text-base leading-relaxed text-muted-on-sand md:text-lg">
          We&apos;re not actively hiring at the moment, but we&apos;re always open to hearing from
          people who care about this space. Send us a note and your resume — we&apos;ll keep it on
          file for when a role opens up.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-sm bg-ink px-10 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase tracking-wide text-paper transition-opacity hover:opacity-80"
        >
          Send Us Your Resume
        </Link>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ValuesSection />
        <LifeAtHypeSection />
        <OpenRolesSection />
      </main>
      <Footer />
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
