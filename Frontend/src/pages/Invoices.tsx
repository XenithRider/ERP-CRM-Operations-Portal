import { useEffect, useState } from "react";
import { FileDown, Search } from "lucide-react";
import { challansService } from "@/services/challansService";
import type { Challan } from "@/types";
import { formatDate } from "@/lib/format";

export function Invoices() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    challansService.list({ status: "CONFIRMED" })
      .then(setChallans)
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(c: Challan) {
    setDownloadingId(c.id);
    try {
      await challansService.downloadInvoice(c.id, c.challan_number);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to download invoice.");
    } finally {
      setDownloadingId(null);
    }
  }

  const filtered = challans.filter(
    (c) =>
      c.challan_number.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
            Invoices
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {challans.length} confirmed challans available for invoicing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-faint)" }} />
            <input
              type="text"
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border py-2.5 pl-9 pr-4 text-sm"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)", color: "var(--color-ink)", width: 240 }}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl inner-border overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        {loading ? (
          <div className="space-y-3 p-6">{[...Array(5)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2">
            <FileDown className="h-8 w-8" style={{ color: "var(--color-ink-faint)" }} />
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              No confirmed challans available.
            </p>
            <p className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
              Confirm a challan in Orders to generate an invoice.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Challan #", "Customer", "Mobile", "Total Qty", "Confirmed On", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-glass)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-4">
                    <span className="num font-semibold" style={{ color: "var(--color-accent-400)" }}>
                      {c.challan_number}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium" style={{ color: "var(--color-ink)" }}>{c.customer_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="num text-xs" style={{ color: "var(--color-ink-muted)" }}>{c.customer_mobile}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="num" style={{ color: "var(--color-ink)" }}>{c.total_quantity} units</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="num text-xs" style={{ color: "var(--color-ink-faint)" }}>{formatDate(c.updated_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleDownload(c)}
                      disabled={downloadingId === c.id}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all disabled:opacity-60"
                      style={{
                        background: "linear-gradient(135deg, #6366f1, #4338ca)",
                        color: "white",
                        boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
                      }}
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      {downloadingId === c.id ? "Generating…" : "Download PDF"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
