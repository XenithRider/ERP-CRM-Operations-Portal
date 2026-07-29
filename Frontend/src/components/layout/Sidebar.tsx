import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Users2, Building2, ShoppingCart, Boxes, Receipt, BarChart3, Settings, Layers, UserCog
} from "lucide-react";
import { cx } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/leads", label: "Leads", icon: Users2 },
  { to: "/accounts", label: "Accounts", icon: Building2 },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const { user } = useAuth();
  
  return (
    <aside
      className="hidden w-60 shrink-0 flex-col md:flex"
      style={{
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, #6366f1, #4338ca)",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
          }}
        >
          <Layers className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="leading-tight">
          <p
            className="font-[var(--font-display)] text-sm font-bold tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            Ops Portal
          </p>
          <p className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
            ERP · CRM
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "text-white"
                  : "hover:text-[var(--color-ink)]"
              )
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(67,56,202,0.15))",
                    color: "var(--color-accent-400)",
                    borderLeft: "2px solid var(--color-accent-500)",
                  }
                : {
                    color: "var(--color-ink-muted)",
                    borderLeft: "2px solid transparent",
                  }
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
        {user?.role === "ADMIN" && (
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "text-white"
                  : "hover:text-[var(--color-ink)]"
              )
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(67,56,202,0.15))",
                    color: "var(--color-accent-400)",
                    borderLeft: "2px solid var(--color-accent-500)",
                  }
                : {
                    color: "var(--color-ink-muted)",
                    borderLeft: "2px solid transparent",
                  }
            }
          >
            <UserCog className="h-4 w-4" />
            Employees
          </NavLink>
        )}
      </nav>

      {/* Settings */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid var(--color-border)" }}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              isActive ? "" : ""
            )
          }
          style={({ isActive }) =>
            isActive
              ? {
                  background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(67,56,202,0.15))",
                  color: "var(--color-accent-400)",
                  borderLeft: "2px solid var(--color-accent-500)",
                }
              : { color: "var(--color-ink-muted)", borderLeft: "2px solid transparent" }
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
