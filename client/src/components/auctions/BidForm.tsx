"use client";

import { useState } from "react";
import { placeBid } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { playBidPlacedSound } from "@/utils/sound";

const QUICK_INCREMENTS = [300, 500, 1000];

export function BidForm({
  listingId,
  currentPrice,
  onPlaced,
}: {
  listingId: string;
  currentPrice: number;
  onPlaced: () => void;
}) {
  const { authFetch } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState(String(currentPrice + QUICK_INCREMENTS[0]));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitBid(value: number) {
    if (!value || value <= currentPrice) {
      toast(`Your bid must be higher than ₹${currentPrice.toLocaleString("en-IN")}.`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await placeBid(authFetch, listingId, value);
      playBidPlacedSound();
      toast("Bid placed!", "success");
      onPlaced();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't place your bid. Try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitBid(Number(amount));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_INCREMENTS.map((inc) => (
          <button
            key={inc}
            type="button"
            onClick={() => submitBid(currentPrice + inc)}
            disabled={isSubmitting}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 font-[family-name:var(--font-barlow)] text-xs font-semibold text-paper transition-colors hover:border-tan disabled:opacity-50"
          >
            +₹{inc.toLocaleString("en-IN")}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex h-12 flex-1 items-center gap-1 rounded-md border border-white/15 bg-white/5 px-4">
          <span className="font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">₹</span>
          <input
            type="number"
            min={currentPrice + 1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent font-[family-name:var(--font-barlow-condensed)] text-lg font-bold text-paper focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 shrink-0 rounded-md bg-tan px-6 font-[family-name:var(--font-barlow)] text-sm font-semibold uppercase text-ink-on-sand transition-colors hover:bg-tan/80 disabled:opacity-50"
        >
          {isSubmitting ? "Placing..." : "Place Bid"}
        </button>
      </form>
    </div>
  );
}
