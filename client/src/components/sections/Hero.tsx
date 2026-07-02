import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { heroAuction } from "@/constants/auctions";

export function Hero() {
  return (
    <section className="bg-sand">
      <Container className="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-6 lg:py-20">
        <div className="order-1">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-[15vw] font-extrabold uppercase leading-[0.85] tracking-tight text-ink-on-sand sm:text-7xl lg:text-[88px] xl:text-[100px]">
            Bid.
            <br />
            Win.
            <br />
            Repeat.
          </h1>
          <p className="mt-6 max-w-xs font-[family-name:var(--font-barlow)] text-base text-ink-on-sand/80">
            India&apos;s first live auction marketplace for hype culture.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/auctions" variant="solid-dark" className="h-12 px-6">
              Browse Auctions
              <ArrowUpRightIcon className="h-4 w-4" />
            </Button>
            <Button href="/sell-with-us" variant="outline-dark" className="h-12 px-6">
              Sell With Us
            </Button>
          </div>
        </div>

        <div className="order-3 relative mx-auto aspect-[4/5] w-full max-w-md lg:order-2 lg:max-w-none">
          <Image
            src={heroAuction.image}
            alt={heroAuction.name}
            fill
            priority
            className="object-contain"
            sizes="(max-width: 1024px) 90vw, 40vw"
          />
        </div>

        <div className="order-2 flex flex-col gap-6 lg:order-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-urgent" />
            <span className="font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-muted-on-sand">
              Live Auction
            </span>
          </div>

          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold uppercase leading-tight text-ink-on-sand">
            {heroAuction.name}
          </h2>

          <div>
            <p className="font-[family-name:var(--font-barlow)] text-xs font-medium uppercase tracking-widest text-muted-on-sand">
              Current Bid
            </p>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-bold text-ink-on-sand">
                {heroAuction.currentBid}
              </span>
              <ArrowUpRightIcon className="h-5 w-5 text-muted-on-sand" />
            </div>
            <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-gold">
              {heroAuction.bidIncrement}
            </p>
          </div>

          <div>
            <p className="font-[family-name:var(--font-barlow)] text-xs font-medium uppercase tracking-widest text-muted-on-sand">
              Ends In
            </p>
            <div className="mt-1 flex items-end gap-4 font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-ink-on-sand">
              <span>
                {heroAuction.endsIn.hr}
                <span className="mx-1">:</span>
                {heroAuction.endsIn.min}
                <span className="mx-1">:</span>
                {heroAuction.endsIn.sec}
              </span>
            </div>
            <div className="mt-1 flex gap-9 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-widest text-muted-on-sand">
              <span>Hr</span>
              <span>Min</span>
              <span>Sec</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button href="/place-bid" variant="solid-dark" className="h-12 flex-1 px-6 sm:flex-none">
              Place Bid
              <ArrowUpRightIcon className="h-4 w-4" />
            </Button>
            <button
              type="button"
              aria-label="Save auction"
              className="flex h-12 w-12 items-center justify-center rounded-md border border-ink-on-sand/30 text-ink-on-sand"
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ArrowUpRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 4h12v16l-6-4-6 4V4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
