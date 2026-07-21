"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createRazorpayOrder, listMyOrders, verifyPayment } from "@/api/orderApi";
import { OrderRowSkeleton } from "@/components/dashboard/OrderRowSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/hooks/useAuth";
import { useCountdown } from "@/hooks/useCountdown";
import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";
import { useToast } from "@/hooks/useToast";
import { formatLocalDateTime } from "@/utils/dateUtils";
import type { Order, OrderStatus } from "@/types/order";

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Payment due",
  paid: "Paid",
  expired: "Expired",
  cancelled: "Cancelled",
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending_payment: "text-gold",
  paid: "text-emerald-600",
  expired: "text-red-urgent",
  cancelled: "text-muted-on-sand",
};

export default function MyOrdersPage() {
  const { authFetch, user } = useAuth();
  const { toast } = useToast();
  const { open } = useRazorpayCheckout();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await listMyOrders(authFetch, page, PAGE_SIZE);
        if (!cancelled) {
          setOrders(data.items);
          setTotal(data.total);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, page, reloadKey]);

  async function handlePay(order: Order) {
    setPayingId(order.id);
    try {
      const rp = await createRazorpayOrder(authFetch, order.id);
      await open({
        key: rp.key_id,
        amount: Math.round(rp.amount * 100),
        currency: rp.currency,
        name: "HYPE.",
        description: order.product?.name ?? "Auction win",
        order_id: rp.razorpay_order_id,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#b8935b" },
        handler: async (response) => {
          try {
            await verifyPayment(authFetch, order.id, response);
            toast("Payment confirmed!", "success");
            setReloadKey((k) => k + 1);
          } catch {
            toast("Payment verification failed. Contact support if you were charged.", "error");
          } finally {
            setPayingId(null);
          }
        },
        modal: { ondismiss: () => setPayingId(null) },
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't start payment. Try again.", "error");
      setPayingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase tracking-tight text-ink-on-sand">
        My Orders
      </h1>
      <p className="mt-1 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
        Items you&apos;ve won — pay within 2 hours or the win moves to the next bidder.
      </p>

      {isLoading ? (
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-8 font-[family-name:var(--font-barlow)] text-sm text-muted-on-sand">
          You haven&apos;t won any auctions yet.
        </p>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-3">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} isPaying={payingId === order.id} onPay={() => handlePay(order)} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

function OrderRow({ order, isPaying, onPay }: { order: Order; isPaying: boolean; onPay: () => void }) {
  const countdown = useCountdown(order.status === "pending_payment" ? order.payment_deadline : null);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-ink-on-sand/10 bg-white/40 px-5 py-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-sand">
        {order.product?.image_url && (
          <Image src={order.product.image_url} alt={order.product.name} fill className="object-cover" sizes="56px" unoptimized />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-[family-name:var(--font-barlow)] text-sm font-medium text-ink-on-sand">
          {order.product?.name ?? order.id}
        </p>
        <p className="font-[family-name:var(--font-barlow)] text-xs text-muted-on-sand">
          ₹{order.amount.toLocaleString("en-IN")} ·{" "}
          <span className={STATUS_CLASSES[order.status]}>{STATUS_LABELS[order.status]}</span>
          {order.status === "pending_payment" && countdown.label ? ` · ${countdown.label} left` : ""}
          {order.status === "paid" && order.paid_at ? ` · Paid ${formatLocalDateTime(order.paid_at)}` : ""}
        </p>
      </div>

      {order.status === "pending_payment" && (
        <button
          type="button"
          onClick={onPay}
          disabled={isPaying}
          className="shrink-0 rounded-md bg-ink-on-sand px-4 py-2 font-[family-name:var(--font-barlow)] text-xs font-semibold uppercase text-paper disabled:opacity-50"
        >
          {isPaying ? "Opening..." : "Pay Now"}
        </button>
      )}
    </div>
  );
}
