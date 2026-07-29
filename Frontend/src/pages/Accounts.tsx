import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { accountsService } from "@/services/accountsService";
import type { Account } from "@/types";
import { formatCurrency, formatDate, initials } from "@/lib/format";

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    accountsService.list().then(setAccounts);
  }, []);

  const columns: Column<Account>[] = [
    {
      key: "name",
      header: "Account",
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-slate-100)] text-xs font-semibold text-[var(--color-slate-600)]">
            {initials(a.name)}
          </div>
          <div>
            <p className="font-medium text-[var(--color-ink)]">{a.name}</p>
            <p className="text-xs text-[var(--color-ink-faint)]">{a.city}, {a.country}</p>
          </div>
        </div>
      ),
      sortValue: (a) => a.name,
    },
    { key: "industry", header: "Industry", render: (a) => a.industry, sortValue: (a) => a.industry },
    { key: "status", header: "Status", render: (a) => <StatusPill status={a.status} />, sortValue: (a) => a.status },
    { key: "owner", header: "Owner", render: (a) => a.owner },
    { key: "openDeals", header: "Open deals", align: "right", render: (a) => <span className="num">{a.openDeals}</span>, sortValue: (a) => a.openDeals },
    { key: "annualRevenue", header: "Annual revenue", align: "right", render: (a) => <span className="num">{formatCurrency(a.annualRevenue)}</span>, sortValue: (a) => a.annualRevenue },
    { key: "createdAt", header: "Since", render: (a) => <span className="num text-[var(--color-ink-muted)]">{formatDate(a.createdAt)}</span>, sortValue: (a) => a.createdAt },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">Accounts</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{accounts.length} accounts under management.</p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          New account
        </Button>
      </div>
      <Card>
        <DataTable
          columns={columns}
          rows={accounts}
          rowKey={(a) => a.id}
          searchFn={(a, q) => a.name.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q)}
          searchPlaceholder="Search accounts…"
        />
      </Card>
    </div>
  );
}
