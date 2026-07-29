import { useEffect, useState } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import { customersService } from "@/services/customersService";
import type { Customer, CreateCustomerPayload, CustomerType } from "@/types";
import { formatDate } from "@/lib/format";

const CUSTOMER_TYPES: CustomerType[] = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];

function CustomerTypeBadge({ type }: { type: CustomerType }) {
  const configs: Record<CustomerType, { bg: string; color: string }> = {
    RETAIL:      { bg: "var(--color-accent-100)",  color: "var(--color-accent-400)" },
    WHOLESALE:   { bg: "var(--color-info-100)",    color: "var(--color-info-500)" },
    DISTRIBUTOR: { bg: "var(--color-warning-100)", color: "var(--color-warning-500)" },
  };
  const cfg = configs[type] ?? configs.RETAIL;
  return <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>{type}</span>;
}

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (c: Customer) => void;
}

function CreateCustomerModal({ open, onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState<CreateCustomerPayload>({
    name: "", mobile: "", email: "", businessName: "", customerType: "RETAIL",
    address: "", notes: "", status: "LEAD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof CreateCustomerPayload, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const customer = await customersService.create(form);
      onCreated(customer);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create customer.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass slide-in w-full max-w-lg rounded-2xl inner-border"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="font-[var(--font-display)] text-base font-semibold" style={{ color: "var(--color-ink)" }}>
            New Lead / Account
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--color-ink-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="modal-label">Full Name *</label>
              <input
                className="modal-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                placeholder="Ravi Kumar"
              />
            </div>
            <div>
              <label className="modal-label">Mobile *</label>
              <input
                className="modal-input"
                value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)}
                required
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="modal-label">Email</label>
              <input
                className="modal-input"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
                placeholder="ravi@example.com"
              />
            </div>
            <div>
              <label className="modal-label">Business Name</label>
              <input
                className="modal-input"
                value={form.businessName ?? ""}
                onChange={(e) => set("businessName", e.target.value)}
                placeholder="Ravi Traders"
              />
            </div>
            <div>
              <label className="modal-label">Customer Type</label>
              <select
                className="modal-input"
                value={form.customerType}
                onChange={(e) => set("customerType", e.target.value)}
              >
                {CUSTOMER_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="modal-label">Status</label>
              <select
                className="modal-input"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="modal-label">Address</label>
            <input
              className="modal-input"
              value={form.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 MG Road, Bengaluru"
            />
          </div>
          <div>
            <label className="modal-label">Notes</label>
            <textarea
              className="modal-input resize-none"
              rows={2}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any additional notes…"
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 rounded-xl border px-4 py-3"
              style={{ background: "var(--color-danger-100)", borderColor: "rgba(244,63,94,0.3)" }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "var(--color-danger-500)" }} />
              <p className="text-sm" style={{ color: "var(--color-danger-500)" }}>{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ color: "var(--color-ink-muted)", background: "var(--color-glass)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4338ca)",
                boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              }}
            >
              {loading ? "Creating…" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Leads() {
  const [leads, setLeads] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    customersService.list({ status: "LEAD" })
      .then(setLeads)
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(c: Customer) {
    if (c.status === "LEAD") setLeads((prev) => [c, ...prev]);
  }

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.business_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      l.mobile.includes(search)
  );

  return (
    <div className="space-y-5 fade-in">
      <CreateCustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
            Leads
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {leads.length} leads in the pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border px-4 py-2.5 text-sm"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border-strong)",
              color: "var(--color-ink)",
              width: 220,
            }}
          />
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #6366f1, #4338ca)",
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
            }}
          >
            <Plus className="h-4 w-4" />
            New Lead
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl inner-border overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        {loading ? (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p style={{ color: "var(--color-ink-muted)" }}>No leads found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Customer", "Mobile", "Type", "Follow-up Date", "Notes", "Since"].map((h) => (
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
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-glass)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{ background: "var(--color-accent-100)", color: "var(--color-accent-400)" }}
                      >
                        {lead.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "var(--color-ink)" }}>{lead.name}</p>
                        {lead.business_name && (
                          <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>{lead.business_name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="num" style={{ color: "var(--color-ink-muted)" }}>{lead.mobile}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <CustomerTypeBadge type={lead.customer_type} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="num text-xs" style={{ color: lead.follow_up_date ? "var(--color-warning-500)" : "var(--color-ink-faint)" }}>
                      {lead.follow_up_date ? formatDate(lead.follow_up_date) : "—"}
                    </span>
                  </td>
                  <td className="max-w-xs px-5 py-3.5">
                    <p className="truncate text-xs" style={{ color: "var(--color-ink-muted)" }}>
                      {lead.notes ?? "—"}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="num text-xs" style={{ color: "var(--color-ink-faint)" }}>
                      {formatDate(lead.created_at)}
                    </span>
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
