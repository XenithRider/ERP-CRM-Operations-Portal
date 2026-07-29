import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users2,
  Building2,
  ShoppingCart,
  Boxes,
  Receipt,
  BarChart3,
  Settings,
  X,
  Layers,
} from "lucide-react";
import { cx } from "@/lib/format";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/leads", label: "Leads & Pipeline", icon: Users2 },
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-ledger-500)] text-white">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <p className="font-[var(--font-display)] text-sm font-semibold">Ops Portal</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-[var(--color-ledger-50)] text-[var(--color-ledger-700)]"
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
