export type DashboardNavItem = {
  label: string;
  href: string;
  icon: "overview" | "listings" | "create" | "orders" | "payouts" | "analytics" | "settings";
};

export const dashboardNavItems: DashboardNavItem[] = [
  { label: "Overview", href: "/dashboard/overview", icon: "overview" },
  { label: "My Listings", href: "/dashboard/my-listings", icon: "listings" },
  { label: "Create Listing", href: "/dashboard/create-listing", icon: "create" },
  { label: "Orders & Shipments", href: "/dashboard/orders-shipments", icon: "orders" },
  { label: "Payouts & Earnings", href: "/dashboard/payouts-earnings", icon: "payouts" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "analytics" },
];

export const dashboardBottomNavItem: DashboardNavItem = {
  label: "Account Settings",
  href: "/dashboard/account-settings",
  icon: "settings",
};
