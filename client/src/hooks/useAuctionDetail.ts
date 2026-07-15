"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAuctionDetail } from "@/api/listingApi";
import { useAuth } from "@/hooks/useAuth";
import { playPriceUpdateSound, playSoldSound } from "@/utils/sound";
import type { AuctionDetail } from "@/types/listing";

const POLL_MS = 3000;

export function useAuctionDetail(listingId: string) {
  const { authFetch, user } = useAuth();
  const userId = user?.id;
  const [detail, setDetail] = useState<AuctionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const detailRef = useRef<AuctionDetail | null>(null);

  const load = useCallback(
    async (skipSoundIfOwnBid = false) => {
      try {
        const data = await getAuctionDetail(authFetch, listingId);
        const prev = detailRef.current;

        if (prev && data.current_price > prev.current_price) {
          const latestBidder = data.bids[0]?.bidder_id;
          const isOwnBidJustPlaced = skipSoundIfOwnBid && latestBidder === userId;
          if (!isOwnBidJustPlaced) playPriceUpdateSound();
        }
        if (prev && prev.auction_status !== "sold" && data.auction_status === "sold") {
          playSoldSound();
        }

        detailRef.current = data;
        setDetail(data);
        setError(null);
      } catch {
        setError("Couldn't load this auction.");
      } finally {
        setIsLoading(false);
      }
    },
    [authFetch, listingId, userId]
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function tick() {
      if (cancelled) return;
      await load(true);
      const status = detailRef.current?.auction_status;
      if (status === "sold" || status === "unsold") {
        if (timer) clearInterval(timer);
      }
    }

    tick();
    timer = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [load]);

  const refreshAfterOwnBid = useCallback(async () => {
    await load(true);
  }, [load]);

  return { detail, isLoading, error, refresh: refreshAfterOwnBid };
}
