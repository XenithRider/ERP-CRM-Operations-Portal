import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { invoicesService } from "@/services/invoicesService";
import type { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";

export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    invoicesService.list().then(setInvoices);
  }, []);

  const columns: Column<Invoice>[] = [
    { key: "invoiceNumber", header: "Invoice #", render: (i) => <span className="num font-medium text-[var(--color-ink)]">{i.invoiceNumber}</span>, sortValue: (i) => i.invoiceNumber },
    { key: "account", header: "Account", render: (i) => i.account, sortValue: (i) => i.account },
    { key: "status", header: "Status", render: (i) => <StatusPill status={i.status} />, sortValue: (i) => i.status },
    { key: "amount", header: "Amount", align: "right", render: (i) => <span className="num">{formatCurrency(i.amount, i.currency)}</span>, sortValue: (i) => i.amount },
    { key: "issuedAt", header: "Issued", render: (i) => <span className="num text-[var(--color-ink-muted)]">{formatDate(i.issuedAt)}</span>, sortValue: (i) => i.issuedAt },
    { key: "dueAt", header: "Due", render: (i) => <span className="num text-[var(--color-ink-muted)]">{formatDate(i.dueAt)}</span>, sortValue: (i) => i.dueAt },
  ];

  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">Invoices</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {formatCurrency(outstanding)} outstanding across {invoices.filter((i) => i.status !== "paid" && i.status !== "void").length} open invoices.
        </p>
      </div>
      <Card>
        <DataTable
          columns={columns}
          rows={invoices}
          rowKey={(i) => i.id}
          searchFn={(i, q) => i.invoiceNumber.toLowerCase().includes(q) || i.account.toLowerCase().includes(q)}
          searchPlaceholder="Search invoices…"
        />
      </Card>
    </div>
  );
}
