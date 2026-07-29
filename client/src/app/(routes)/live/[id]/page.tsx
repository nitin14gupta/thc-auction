"use client";

import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuctionDetailView } from "@/components/auctions/AuctionDetailView";

export default function LiveAuctionDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-sand">
        <Navbar />
        <main className="flex-1 px-6 py-10 md:px-10">
          <AuctionDetailView id={params.id} backHref="/live" scope="live" />
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}
