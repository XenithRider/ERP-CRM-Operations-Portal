import { useEffect, useState } from "react";
import {
  Users, Building2, ShoppingCart, CheckCircle, AlertTriangle, Package, Clock, TrendingUp,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import type { DashboardMetrics, Challan, Customer } from "@/types";
import { formatDate } from "@/lib/format";

function StatCard({
  label,
  value,
  icon,
  color,
  subLabel,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subLabel?: string;
}) {
  return (
    <div
      className="glass rounded-2xl p-5 fade-in inner-border"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-ink-muted)" }}>
            {label}
          </p>
          <p
            className="mt-2 text-3xl font-bold font-[var(--font-display)]"
            style={{ color: "var(--color-ink)" }}
          >
            {value}
          </p>
          {subLabel && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-ink-faint)" }}>
              {subLabel}
            </p>
          )}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: color, boxShadow: `0 4px 12px ${color}66` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChallanStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT:     { bg: "var(--color-warning-100)", color: "var(--color-warning-500)", label: "Draft" },
    CONFIRMED: { bg: "var(--color-success-100)", color: "var(--color-success-500)", label: "Confirmed" },
    CANCELLED: { bg: "var(--color-danger-100)",  color: "var(--color-danger-500)",  label: "Cancelled" },
  };
  const cfg = configs[status] ?? configs.DRAFT;
  return (
    <span
      className="badge"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getMetrics()
      .then(setMetrics)
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-48 shimmer rounded-lg" />
          <div className="mt-2 h-4 w-64 shimmer rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border" style={{ borderColor: "var(--color-border)" }}>
        <p style={{ color: "var(--color-danger-500)" }}>{error ?? "No data available."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1
          className="font-[var(--font-display)] text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-ink)" }}
        >
          Operations Overview
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Live stats from your ERP/CRM database.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Leads"
          value={metrics.totalLeads}
          icon={<Users className="h-5 w-5 text-white" />}
          color="var(--color-accent-600)"
          subLabel="Customers with LEAD status"
        />
        <StatCard
          label="Active Accounts"
          value={metrics.totalAccounts}
          icon={<Building2 className="h-5 w-5 text-white" />}
          color="var(--color-success-600)"
          subLabel="Customers with ACTIVE status"
        />
        <StatCard
          label="Open Orders"
          value={metrics.totalDraftChallans}
          icon={<ShoppingCart className="h-5 w-5 text-white" />}
          color="var(--color-warning-600)"
          subLabel="Challans in DRAFT"
        />
        <StatCard
          label="Confirmed Orders"
          value={metrics.totalConfirmedChallans}
          icon={<CheckCircle className="h-5 w-5 text-white" />}
          color="var(--color-success-500)"
          subLabel="Ready for invoicing"
        />
        <StatCard
          label="Low Stock Items"
          value={metrics.lowStockProducts}
          icon={<AlertTriangle className="h-5 w-5 text-white" />}
          color="var(--color-danger-500)"
          subLabel={`of ${metrics.totalProducts} total products`}
        />
        <StatCard
          label="Total Products"
          value={metrics.totalProducts}
          icon={<Package className="h-5 w-5 text-white" />}
          color="var(--color-accent-500)"
          subLabel="In product catalog"
        />
      </div>

      {/* Recent activity grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Recent Challans */}
        <div
          className="glass rounded-2xl inner-border"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        >
          <div
            className="flex items-center gap-2.5 border-b px-5 py-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: "var(--color-accent-400)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
              Recent Challans
            </h2>
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {metrics.recentChallans.length === 0 ? (
              <li className="py-8 text-center text-sm" style={{ color: "var(--color-ink-muted)" }}>
                No challans yet.
              </li>
            ) : (
              metrics.recentChallans.map((c: Challan) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div>
                    <p className="text-sm font-medium num" style={{ color: "var(--color-ink)" }}>
                      {c.challan_number}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                      {c.customer_name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <ChallanStatusBadge status={c.status} />
                    <span className="text-[11px] num" style={{ color: "var(--color-ink-faint)" }}>
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Customers */}
        <div
          className="glass rounded-2xl inner-border"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        >
          <div
            className="flex items-center gap-2.5 border-b px-5 py-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Clock className="h-4 w-4" style={{ color: "var(--color-accent-400)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
              Recent Customers
            </h2>
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {metrics.recentCustomers.length === 0 ? (
              <li className="py-8 text-center text-sm" style={{ color: "var(--color-ink-muted)" }}>
                No customers yet.
              </li>
            ) : (
              metrics.recentCustomers.map((c: Customer) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        background: "var(--color-accent-100)",
                        color: "var(--color-accent-400)",
                      }}
                    >
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                        {c.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                        {c.business_name ?? c.mobile}
                      </p>
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background:
                        c.status === "LEAD"
                          ? "var(--color-warning-100)"
                          : c.status === "ACTIVE"
                          ? "var(--color-success-100)"
                          : "var(--color-danger-100)",
                      color:
                        c.status === "LEAD"
                          ? "var(--color-warning-500)"
                          : c.status === "ACTIVE"
                          ? "var(--color-success-500)"
                          : "var(--color-danger-500)",
                    }}
                  >
                    {c.status}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
