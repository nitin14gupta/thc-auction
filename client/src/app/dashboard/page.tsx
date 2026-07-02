"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/hooks/useAuth";

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-ink">
      <Container className="py-14">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight text-paper">
            HYPE.
          </span>
          <Button variant="outline-light" onClick={handleLogout}>
            Log Out
          </Button>
        </div>

        <div className="mt-14">
          <p className="font-[family-name:var(--font-barlow)] text-sm font-medium uppercase tracking-widest text-gray-on-dark">
            Dashboard
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-4xl font-extrabold uppercase tracking-tight text-paper">
            Welcome back, {user?.name}.
          </h1>
          <p className="mt-3 max-w-lg font-[family-name:var(--font-barlow)] text-sm text-gray-on-dark">
            {user?.email} — your live auctions, bids, and account settings will show up here.
          </p>
        </div>
      </Container>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
