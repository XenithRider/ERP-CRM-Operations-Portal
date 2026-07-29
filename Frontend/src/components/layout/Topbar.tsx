import { useState } from "react";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { MobileNav } from "./MobileNav";

export function Topbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <input
              placeholder="Search accounts, leads, orders…"
              className="w-56 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-paper)] py-2 pl-8 pr-3 text-sm placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-ledger-500)] focus:bg-[var(--color-surface)] md:w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden items-center gap-1.5 rounded-md bg-[var(--color-ledger-500)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--color-ledger-600)] sm:inline-flex">
            <Plus className="h-4 w-4" />
            Quick create
          </button>
          <button className="relative rounded-md p-2 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-clay-500)]" />
          </button>
          <div className="flex items-center gap-2 border-l border-[var(--color-border)] pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ledger-100)] text-xs font-semibold text-[var(--color-ledger-700)]">
              {user?.avatarInitials ?? "?"}
            </div>
            <div className="hidden leading-tight lg:block">
              <p className="text-sm font-medium text-[var(--color-ink)]">{user?.name}</p>
              <p className="text-xs capitalize text-[var(--color-ink-faint)]">{user?.role}</p>
            </div>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
