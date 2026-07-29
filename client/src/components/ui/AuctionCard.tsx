import Image from "next/image";
import type { AuctionCardData } from "@/constants/auctions";

export function AuctionCard({ name, price, timeLeft, urgent, watching, meta, image }: AuctionCardData) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-ink transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/50">
      <div className="relative aspect-[4/3] w-full">
        <Image src={image} alt={name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 16vw" />
        <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[10px] font-bold uppercase tracking-wider text-white">
          LIVE
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        <h3 className="font-[family-name:var(--font-barlow)] text-base font-medium text-paper">{name}</h3>

        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-barlow-condensed)] text-xl font-bold text-paper">
            {price}
          </span>
          <span
            className={`font-[family-name:var(--font-barlow-condensed)] text-lg font-semibold ${
              urgent ? "text-red-urgent" : "text-gold"
            }`}
          >
            {timeLeft}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-3 font-[family-name:var(--font-barlow)] text-xs text-gray-on-dark">
          <span>{watching} watching</span>
          <span>{meta}</span>
        </div>
      </div>
    </article>
  );
}
