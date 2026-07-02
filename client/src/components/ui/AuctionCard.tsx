import Image from "next/image";
import type { AuctionCardData } from "@/constants/auctions";

export function AuctionCard({ name, price, timeLeft, urgent, watching, meta, image }: AuctionCardData) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-white/10 bg-ink">
      <div className="relative aspect-[4/3] w-full">
        <Image src={image} alt={name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 16vw" />
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
