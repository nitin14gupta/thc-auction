"use client";

import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AuctionDetailView } from "@/components/auctions/AuctionDetailView";

export default function LiveAuctionDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-ink">
        <Navbar />
        <div className="flex-1 py-10">
          <Container>
            <AuctionDetailView id={params.id} backHref="/live" scope="live" />
          </Container>
        </div>
        <Footer />
      </div>
    </RequireAuth>
  );
}
