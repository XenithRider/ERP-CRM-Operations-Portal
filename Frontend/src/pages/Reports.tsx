import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { RevenueTrendChart } from "@/components/charts/RevenueTrendChart";
import { PipelineChart } from "@/components/charts/PipelineChart";
import { dashboardService } from "@/services/dashboardService";
import { ordersService } from "@/services/ordersService";
import type { DashboardMetrics, Order } from "@/types";
import { formatCurrency } from "@/lib/format";

export function Reports() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    dashboardService.getMetrics().then(setMetrics);
    ordersService.list().then(setOrders);
  }, []);

  if (!metrics) return null;

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">Reports</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Revenue, pipeline, and fulfillment summaries.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue vs target — last 6 months</CardTitle></CardHeader>
          <CardBody><RevenueTrendChart data={metrics.revenueTrend} /></CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pipeline value by stage</CardTitle></CardHeader>
          <CardBody><PipelineChart data={metrics.pipelineByStage} /></CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Orders by fulfillment status</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="rounded-md border border-[var(--color-border)] p-3 text-center">
                <p className="num text-xl font-semibold text-[var(--color-ink)]">{count}</p>
                <p className="mt-1 text-xs capitalize text-[var(--color-ink-muted)]">{status}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Total pipeline</p>
            <p className="num mt-1 text-lg font-semibold">{formatCurrency(metrics.pipelineValue)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Order value (open)</p>
            <p className="num mt-1 text-lg font-semibold">{formatCurrency(orders.reduce((s, o) => s + o.total, 0))}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Revenue (month)</p>
            <p className="num mt-1 text-lg font-semibold">{formatCurrency(metrics.monthRevenue)}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
