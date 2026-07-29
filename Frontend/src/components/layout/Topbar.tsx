import { useState } from "react";
import { Bell, Menu, Search, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MobileNav } from "./MobileNav";

export function Topbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <>
      <header
        className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 md:px-6"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-xl p-2 transition-colors md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            style={{ color: "var(--color-ink-muted)", background: "var(--color-glass)" }}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--color-ink-faint)" }}
            />
            <input
              placeholder="Search accounts, leads, orders…"
              className="w-56 rounded-xl border py-2 pl-9 pr-3 text-sm transition-all md:w-72"
              style={{
                background: "var(--color-surface-sunken)",
                borderColor: "var(--color-border-strong)",
                color: "var(--color-ink)",
              }}
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            className="relative rounded-xl p-2 transition-colors"
            aria-label="Notifications"
            style={{ color: "var(--color-ink-muted)", background: "var(--color-glass)" }}
          >
            <Bell className="h-4.5 w-4.5" />
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2"
              style={{
                background: "var(--color-accent-500)",
                borderColor: "var(--color-surface)",
              }}
            />
          </button>

          {/* User */}
          <div
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5"
            style={{
              background: "var(--color-glass)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4338ca)",
                color: "white",
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
              }}
            >
              {initials}
            </div>
            <div className="hidden leading-tight lg:block">
              <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                {user?.name}
              </p>
              <p className="text-[11px] uppercase tracking-widest" style={{ color: "var(--color-ink-faint)" }}>
                {user?.role}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
            aria-label="Logout"
            title="Logout"
            style={{
              background: "var(--color-danger-100)",
              color: "var(--color-danger-500)",
              border: "1px solid rgba(244,63,94,0.2)",
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
