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
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-ledger-500)] text-white">
          <Layers className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <p className="font-[var(--font-display)] text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            Ops Portal
          </p>
          <p className="text-[11px] text-[var(--color-ink-faint)]">ERP · CRM</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-ledger-50)] text-[var(--color-ledger-700)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] px-3 py-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cx(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--color-ledger-50)] text-[var(--color-ledger-700)]"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
            )
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
