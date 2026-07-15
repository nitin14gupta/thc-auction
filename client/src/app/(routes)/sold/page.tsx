"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionBrowseView } from "@/components/auctions/AuctionBrowseView";

export default function SoldPage() {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <AuctionBrowseView scope="sold" title="Sold" subtitle="Recently closed auctions and their final price." />
        </div>
        <Footer />
      </div>
    </RequireAuth>
  );
}
