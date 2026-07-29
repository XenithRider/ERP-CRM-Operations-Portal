import type { ReactNode } from "react";
import { cx } from "@/lib/format";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  icon: ReactNode;
  tone?: "ledger" | "amber" | "clay" | "slate";
}

const TONE_BG: Record<string, string> = {
  ledger: "bg-[var(--color-ledger-50)] text-[var(--color-ledger-600)]",
  amber: "bg-[var(--color-amber-100)] text-[var(--color-amber-600)]",
  clay: "bg-[var(--color-clay-100)] text-[var(--color-clay-600)]",
  slate: "bg-[var(--color-slate-100)] text-[var(--color-slate-600)]",
};

export function StatCard({ label, value, delta, deltaSuffix = "% vs last month", icon, tone = "ledger" }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="ledger-tab rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5" style={{ borderLeftColor: `var(--color-${tone}-500)` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">{label}</p>
          <p className="num mt-2 text-2xl font-semibold text-[var(--color-ink)]">{value}</p>
        </div>
        <div className={cx("rounded-md p-2", TONE_BG[tone])}>{icon}</div>
      </div>
      {delta !== undefined && (
        <p className={cx("num mt-3 text-xs font-medium", positive ? "text-[var(--color-ledger-600)]" : "text-[var(--color-clay-600)]")}>
          {positive ? "+" : ""}
          {delta}
          {deltaSuffix}
        </p>
      )}
    </div>
  );
}
