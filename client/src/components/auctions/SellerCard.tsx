import Image from "next/image";
import type { AuctionSeller } from "@/types/listing";

export function SellerCard({ seller }: { seller: AuctionSeller }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="mb-3 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase tracking-widest text-gray-on-dark">
        Seller
      </p>
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
          {seller.avatar_url ? (
            <Image src={seller.avatar_url} alt={seller.name} fill className="object-cover" sizes="40px" unoptimized />
          ) : (
            <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-bold uppercase text-tan">
              {seller.name.charAt(0)}
            </span>
          )}
        </div>
        <p className="font-[family-name:var(--font-barlow)] text-sm font-medium text-paper">{seller.name}</p>
      </div>
    </div>
  );
}
