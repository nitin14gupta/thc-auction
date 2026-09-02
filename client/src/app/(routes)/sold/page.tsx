"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionBrowseView } from "@/components/auctions/AuctionBrowseView";

export default function SoldPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Suspense fallback={null}>
          <AuctionBrowseView scope="sold" title="Sold" subtitle="Recently closed auctions and their final price." />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
