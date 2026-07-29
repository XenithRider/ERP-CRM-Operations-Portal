import { useEffect, useState } from "react";
import { Plus, X, AlertCircle, CheckCircle, XCircle, FileDown, Eye } from "lucide-react";
import { challansService } from "@/services/challansService";
import { customersService } from "@/services/customersService";
import { productsService } from "@/services/productsService";
import type { Challan, CreateChallanPayload, Customer, Product } from "@/types";
import { formatDate } from "@/lib/format";
import { API_BASE_URL } from "@/services/apiClient";

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    DRAFT:     { bg: "var(--color-warning-100)", color: "var(--color-warning-500)" },
    CONFIRMED: { bg: "var(--color-success-100)", color: "var(--color-success-500)" },
    CANCELLED: { bg: "var(--color-danger-100)",  color: "var(--color-danger-500)" },
  };
  const c = cfg[status] ?? cfg.DRAFT;
  return <span className="badge" style={{ background: c.bg, color: c.color }}>{status}</span>;
}

interface ChallanItem {
  productId: string | number;
  qtyStr: string; // stored as raw string so user can freely type
}

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (c: Challan) => void;
  customers: Customer[];
  products: Product[];
}

function CreateChallanModal({ open, onClose, onCreated, customers, products }: CreateModalProps) {
  const [customerId, setCustomerId] = useState<string>("");
  const [items, setItems] = useState<ChallanItem[]>([{ productId: "", qtyStr: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state every time the modal opens
  useEffect(() => {
    if (open) {
      setCustomerId("");
      setItems([{ productId: "", qtyStr: "" }]);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  function addItem() { setItems((prev) => [...prev, { productId: "", qtyStr: "" }]); }
  function removeItem(i: number) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }
  function setProduct(i: number, pid: string) {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, productId: pid } : item));
  }
  // Store the raw string — never force a value while the user is typing
  function setQty(i: number, raw: string) {
    // Allow only digits
    const digits = raw.replace(/[^0-9]/g, "");
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, qtyStr: digits } : item));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) { setError("Please select a customer."); return; }
    if (items.some((it) => !it.productId)) { setError("Please select a product for each item."); return; }
    // Parse and validate quantities at submit time
    const parsedItems = items.map((it) => ({
      productId: Number(it.productId),
      quantity: parseInt(it.qtyStr, 10),
    }));
    if (parsedItems.some((it) => isNaN(it.quantity) || it.quantity < 1)) {
      setError("Each item must have a valid quantity (minimum 1).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: CreateChallanPayload = {
        customerId: Number(customerId),
        items: parsedItems,
      };
      const challan = await challansService.create(payload);
      onCreated(challan);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create challan.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass slide-in w-full max-w-xl rounded-2xl inner-border"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.7)", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-[var(--font-display)] text-base font-semibold" style={{ color: "var(--color-ink)" }}>New Challan (Draft Order)</h2>
          <button onClick={onClose} className="rounded-lg p-1.5" style={{ color: "var(--color-ink-muted)" }}><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="modal-label">Customer *</label>
            <select className="modal-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.business_name ? `(${c.business_name})` : ""}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="modal-label mb-0">Items *</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ background: "var(--color-accent-100)", color: "var(--color-accent-400)" }}
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>

            {/* Column headers */}
            <div className="mb-1 grid gap-2" style={{ gridTemplateColumns: "1fr 80px 32px" }}>
              <span className="px-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-ink-faint)" }}>Product</span>
              <span className="text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-ink-faint)" }}>Qty</span>
              <span />
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="grid items-center gap-2"
                  style={{ gridTemplateColumns: "1fr 80px 32px" }}
                >
                  {/* Product select */}
                  <select
                    className="modal-input"
                    value={String(item.productId)}
                    onChange={(e) => setProduct(i, e.target.value)}
                    style={{ minWidth: 0 }}
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — Stock: {p.current_stock}
                      </option>
                    ))}
                  </select>

                  {/* Quantity input */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={item.qtyStr}
                    onChange={(e) => setQty(i, e.target.value)}
                    className="modal-input text-center"
                    placeholder="Qty"
                    style={{ MozAppearance: "textfield", padding: "0.625rem 0.5rem" } as React.CSSProperties}
                  />

                  {/* Remove button (always reserve the space) */}
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                      style={{ background: "var(--color-danger-100)", color: "var(--color-danger-500)" }}
                      title="Remove item"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="h-8 w-8" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border px-4 py-3" style={{ background: "var(--color-danger-100)", borderColor: "rgba(244,63,94,0.3)" }}>
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "var(--color-danger-500)" }} />
              <p className="text-sm" style={{ color: "var(--color-danger-500)" }}>{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium" style={{ color: "var(--color-ink-muted)", background: "var(--color-glass)" }}>Cancel</button>
            <button type="submit" disabled={loading} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>
              {loading ? "Creating…" : "Create Challan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Orders() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([challansService.list(), customersService.list(), productsService.list()])
      .then(([c, cu, p]) => {
        setChallans(c);
        setCustomers(cu);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(c: Challan) { setChallans((prev) => [c, ...prev]); }

  async function handleConfirm(id: string | number) {
    setActionLoading(id);
    try {
      const updated = await challansService.confirm(id);
      setChallans((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to confirm challan.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(id: string | number) {
    if (!confirm("Cancel this challan?")) return;
    setActionLoading(id);
    try {
      const updated = await challansService.cancel(id);
      setChallans((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel challan.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDownload(c: Challan) {
    try {
      await challansService.downloadInvoice(c.id, c.challan_number);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to download invoice.");
    }
  }

  async function handlePreview(c: Challan) {
    try {
      const token = localStorage.getItem("ops_portal_token");
      const res = await fetch(
        `${API_BASE_URL}/challans/${c.id}/invoice`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // Revoke after a short delay so the tab has time to load
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to preview invoice.");
    }
  }

  const filtered = challans.filter(
    (c) =>
      c.challan_number.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 fade-in">
      <CreateChallanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
        customers={customers}
        products={products}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>Orders (Challans)</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>{challans.length} challans total.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border px-4 py-2.5 text-sm"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)", color: "var(--color-ink)", width: 220 }}
          />
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
          >
            <Plus className="h-4 w-4" /> New Order
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl inner-border overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        {loading ? (
          <div className="space-y-3 p-6">{[...Array(5)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p style={{ color: "var(--color-ink-muted)" }}>No orders found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Challan #", "Customer", "Items", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-ink-muted)" }}>{h}</th>
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
                  <td className="px-5 py-3.5">
                    <span className="num font-semibold" style={{ color: "var(--color-accent-400)" }}>{c.challan_number}</span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--color-ink)" }}>{c.customer_name}</td>
                  <td className="px-5 py-3.5">
                    <span className="num" style={{ color: "var(--color-ink-muted)" }}>{c.total_quantity} units</span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5">
                    <span className="num text-xs" style={{ color: "var(--color-ink-faint)" }}>{formatDate(c.created_at)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {c.status === "DRAFT" && (
                        <>
                          <button
                            onClick={() => handleConfirm(c.id)}
                            disabled={actionLoading === c.id}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                            style={{ background: "var(--color-success-100)", color: "var(--color-success-500)" }}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {actionLoading === c.id ? "…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => handleCancel(c.id)}
                            disabled={actionLoading === c.id}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                            style={{ background: "var(--color-danger-100)", color: "var(--color-danger-500)" }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </>
                      )}
                      {c.status === "CONFIRMED" && (
                        <>
                          <button
                            onClick={() => handlePreview(c)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                            style={{ background: "var(--color-accent-50)", color: "var(--color-accent-400)", border: "1px solid var(--color-border)" }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownload(c)}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                            style={{ background: "var(--color-accent-100)", color: "var(--color-accent-400)" }}
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            Download
                          </button>
                        </>
                      )}
                    </div>
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
