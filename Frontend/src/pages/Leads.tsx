import { useEffect, useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { leadsService } from "@/services/leadsService";
import type { Lead, LeadStage } from "@/types";
import { formatCurrency, formatDate, cx } from "@/lib/format";

const STAGES: LeadStage[] = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [view, setView] = useState<"pipeline" | "list">("pipeline");

  useEffect(() => {
    leadsService.list().then(setLeads);
  }, []);

  function moveStage(lead: Lead, stage: LeadStage) {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, stage } : l)));
    leadsService.updateStage(lead.id, stage);
  }

  const columns: Column<Lead>[] = [
    { key: "company", header: "Company", render: (l) => (
      <div>
        <p className="font-medium text-[var(--color-ink)]">{l.company}</p>
        <p className="text-xs text-[var(--color-ink-faint)]">{l.contact}</p>
      </div>
    ), sortValue: (l) => l.company },
    { key: "stage", header: "Stage", render: (l) => <StatusPill status={l.stage} />, sortValue: (l) => l.stage },
    { key: "value", header: "Value", align: "right", render: (l) => <span className="num">{formatCurrency(l.value)}</span>, sortValue: (l) => l.value },
    { key: "owner", header: "Owner", render: (l) => l.owner, sortValue: (l) => l.owner },
    { key: "source", header: "Source", render: (l) => l.source },
    { key: "updatedAt", header: "Updated", render: (l) => <span className="num text-[var(--color-ink-muted)]">{formatDate(l.updatedAt)}</span>, sortValue: (l) => l.updatedAt },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">
            Leads &amp; pipeline
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {leads.length} leads worth {formatCurrency(leads.reduce((s, l) => s + l.value, 0))} in flight.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-[var(--color-border-strong)] p-0.5">
            <button
              onClick={() => setView("pipeline")}
              className={cx("rounded px-2.5 py-1.5 text-xs font-medium", view === "pipeline" ? "bg-[var(--color-ledger-500)] text-white" : "text-[var(--color-ink-muted)]")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cx("rounded px-2.5 py-1.5 text-xs font-medium", view === "list" ? "bg-[var(--color-ledger-500)] text-white" : "text-[var(--color-ink-muted)]")}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            New lead
          </Button>
        </div>
      </div>

      {view === "pipeline" ? (
        <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage);
            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
            return (
              <div key={stage} className="w-72 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{STAGE_LABEL[stage]}</p>
                  <span className="num text-xs text-[var(--color-ink-faint)]">{formatCurrency(stageValue)}</span>
                </div>
                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="ledger-tab p-3" style={{ borderLeftColor: "var(--color-ledger-500)" }}>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{lead.company}</p>
                      <p className="text-xs text-[var(--color-ink-faint)]">{lead.contact}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="num text-xs font-medium text-[var(--color-ledger-600)]">{formatCurrency(lead.value)}</span>
                        <select
                          value={lead.stage}
                          onChange={(e) => moveStage(lead, e.target.value as LeadStage)}
                          className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-1 text-[11px] text-[var(--color-ink-muted)]"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{STAGE_LABEL[s]}</option>
                          ))}
                        </select>
                      </div>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="rounded-md border border-dashed border-[var(--color-border)] p-3 text-center text-xs text-[var(--color-ink-faint)]">
                      No leads
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <DataTable
            columns={columns}
            rows={leads}
            rowKey={(l) => l.id}
            searchFn={(l, q) => l.company.toLowerCase().includes(q) || l.contact.toLowerCase().includes(q)}
            searchPlaceholder="Search leads…"
          />
        </Card>
      )}
    </div>
  );
}
