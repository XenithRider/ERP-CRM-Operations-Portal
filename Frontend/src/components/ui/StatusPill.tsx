import { cx } from "@/lib/format";

// Maps any status-like string across leads, orders, accounts, and
// invoices onto one consistent three-color semantic system:
// ledger (positive/active), amber (pending/attention), clay (risk/negative).
const STATUS_MAP: Record<string, { label: string; tone: "ledger" | "amber" | "clay" | "slate" | "neutral" }> = {
  active: { label: "Active", tone: "ledger" },
  won: { label: "Won", tone: "ledger" },
  paid: { label: "Paid", tone: "ledger" },
  delivered: { label: "Delivered", tone: "ledger" },
  confirmed: { label: "Confirmed", tone: "slate" },
  shipped: { label: "Shipped", tone: "slate" },
  processing: { label: "Processing", tone: "slate" },
  sent: { label: "Sent", tone: "slate" },
  pending: { label: "Pending", tone: "amber" },
  draft: { label: "Draft", tone: "neutral" },
  new: { label: "New", tone: "neutral" },
  contacted: { label: "Contacted", tone: "slate" },
  qualified: { label: "Qualified", tone: "amber" },
  proposal: { label: "Proposal", tone: "amber" },
  at_risk: { label: "At risk", tone: "clay" },
  overdue: { label: "Overdue", tone: "clay" },
  cancelled: { label: "Cancelled", tone: "clay" },
  lost: { label: "Lost", tone: "clay" },
  inactive: { label: "Inactive", tone: "neutral" },
  void: { label: "Void", tone: "neutral" },
  closed: { label: "Closed", tone: "neutral" },
};

const TONE_CLASSES: Record<string, string> = {
  ledger: "bg-[var(--color-ledger-100)] text-[var(--color-ledger-700)]",
  amber: "bg-[var(--color-amber-100)] text-[var(--color-amber-600)]",
  clay: "bg-[var(--color-clay-100)] text-[var(--color-clay-600)]",
  slate: "bg-[var(--color-slate-100)] text-[var(--color-slate-600)]",
  neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]",
};

export function StatusPill({ status }: { status: string }) {
  const meta = STATUS_MAP[status] ?? { label: status, tone: "neutral" as const };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[meta.tone]
      )}
    >
      <span
        className={cx(
          "h-1.5 w-1.5 rounded-full",
          meta.tone === "ledger" && "bg-[var(--color-ledger-500)]",
          meta.tone === "amber" && "bg-[var(--color-amber-500)]",
          meta.tone === "clay" && "bg-[var(--color-clay-500)]",
          meta.tone === "slate" && "bg-[var(--color-slate-500)]",
          meta.tone === "neutral" && "bg-[var(--color-ink-faint)]"
        )}
      />
      {meta.label}
    </span>
  );
}

