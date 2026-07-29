import { useEffect, useState } from "react";
import { Wallet, ShoppingCart, TrendingUp, PackageX } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { RevenueTrendChart } from "@/components/charts/RevenueTrendChart";
import { PipelineChart } from "@/components/charts/PipelineChart";
import { dashboardService } from "@/services/dashboardService";
import type { DashboardMetrics } from "@/types";
import { formatCurrency } from "@/lib/format";
import { cx } from "@/lib/format";

const ACTIVITY_DOT: Record<string, string> = {
  lead: "bg-[var(--color-slate-500)]",
  order: "bg-[var(--color-ledger-500)]",
  invoice: "bg-[var(--color-amber-500)]",
  account: "bg-[var(--color-clay-500)]",
};

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    dashboardService.getMetrics().then(setMetrics);
  }, []);

  if (!metrics) {
    return <div className="p-8 text-sm text-[var(--color-ink-muted)]">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">
          Operations overview
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Pipeline, orders, and fulfillment status at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pipeline value"
          value={formatCurrency(metrics.pipelineValue)}
          delta={metrics.pipelineDelta}
          icon={<Wallet className="h-4.5 w-4.5" />}
          tone="ledger"
        />
        <StatCard
          label="Open orders"
          value={String(metrics.openOrders)}
          delta={metrics.openOrdersDelta}
          deltaSuffix=" vs last week"
          icon={<ShoppingCart className="h-4.5 w-4.5" />}
          tone="slate"
        />
        <StatCard
          label="Revenue this month"
          value={formatCurrency(metrics.monthRevenue)}
          delta={metrics.monthRevenueDelta}
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          tone="ledger"
        />
        <StatCard
          label="Low stock items"
          value={String(metrics.lowStockItems)}
          delta={metrics.lowStockDelta}
          deltaSuffix=" new this week"
          icon={<PackageX className="h-4.5 w-4.5" />}
          tone="clay"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs target</CardTitle>
            <div className="flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-ledger-500)]" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-ink-faint)]" />Target</span>
            </div>
          </CardHeader>
          <CardBody>
            <RevenueTrendChart data={metrics.revenueTrend} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline by stage</CardTitle>
          </CardHeader>
          <CardBody>
            <PipelineChart data={metrics.pipelineByStage} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <ul className="divide-y divide-[var(--color-border)]">
            {metrics.recentActivity.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                <span className={cx("h-2 w-2 shrink-0 rounded-full", ACTIVITY_DOT[item.type])} />
                <p className="flex-1 text-sm text-[var(--color-ink)]">{item.message}</p>
                <span className="num text-xs text-[var(--color-ink-faint)]">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
