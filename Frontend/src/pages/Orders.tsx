import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { ordersService } from "@/services/ordersService";
import type { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    ordersService.list().then(setOrders);
  }, []);

  const columns: Column<Order>[] = [
    { key: "orderNumber", header: "Order #", render: (o) => <span className="num font-medium text-[var(--color-ink)]">{o.orderNumber}</span>, sortValue: (o) => o.orderNumber },
    { key: "account", header: "Account", render: (o) => o.account, sortValue: (o) => o.account },
    { key: "status", header: "Status", render: (o) => <StatusPill status={o.status} />, sortValue: (o) => o.status },
    { key: "total", header: "Total", align: "right", render: (o) => <span className="num">{formatCurrency(o.total, o.currency)}</span>, sortValue: (o) => o.total },
    { key: "createdAt", header: "Created", render: (o) => <span className="num text-[var(--color-ink-muted)]">{formatDate(o.createdAt)}</span>, sortValue: (o) => o.createdAt },
    { key: "eta", header: "ETA", render: (o) => <span className="num text-[var(--color-ink-muted)]">{formatDate(o.eta)}</span>, sortValue: (o) => o.eta },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">Orders</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{orders.length} orders across all accounts.</p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          New order
        </Button>
      </div>
      <Card>
        <DataTable
          columns={columns}
          rows={orders}
          rowKey={(o) => o.id}
          searchFn={(o, q) => o.orderNumber.toLowerCase().includes(q) || o.account.toLowerCase().includes(q)}
          searchPlaceholder="Search orders…"
        />
      </Card>
    </div>
  );
}
