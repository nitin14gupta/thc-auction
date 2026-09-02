import { dashboardBottomNavItem, dashboardNavItems } from "@/constants/dashboardNav";
import { SidebarNavItem } from "@/components/dashboard/SidebarNavItem";
import { VerifiedSellerBadge } from "@/components/dashboard/VerifiedSellerBadge";

export function Sidebar() {
  return (
    <aside className="sticky top-[88px] flex h-[calc(100vh-104px)] w-[240px] shrink-0 flex-col gap-5 rounded-xl bg-cover bg-[position:75%_center] p-4" style={{ backgroundImage: "url(/images/Dashboard.webp)" }}>
      <VerifiedSellerBadge />

      <nav className="flex flex-col gap-1">
        {dashboardNavItems.map((item) => (
          <SidebarNavItem key={item.href} item={item} />
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-3">
        <SidebarNavItem item={dashboardBottomNavItem} />
      </div>
    </aside>
  );
}
