import { useEffect, useState } from "react";
import { Plus, X, AlertCircle, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { productsService } from "@/services/productsService";
import { inventoryService } from "@/services/inventoryService";
import type { Product, CreateProductPayload, CreateMovementPayload, MovementType } from "@/types";
import { formatDate } from "@/lib/format";

function StockBadge({ current, min }: { current: number; min: number }) {
  const isLow = current <= min;
  return (
    <span
      className="badge"
      style={{
        background: isLow ? "var(--color-danger-100)" : "var(--color-success-100)",
        color: isLow ? "var(--color-danger-500)" : "var(--color-success-500)",
      }}
    >
      {current} {isLow ? "⚠ Low" : "OK"}
    </span>
  );
}

interface MovementModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  onDone: (updatedProducts: Product[]) => void;
}

function MovementModal({ open, onClose, products, onDone }: MovementModalProps) {
  const [productId, setProductId] = useState<string>("");
  const [movementType, setMovementType] = useState<MovementType>("IN");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) { setError("Please select a product."); return; }
    setLoading(true);
    setError(null);
    try {
      const payload: CreateMovementPayload = {
        productId: Number(productId),
        quantity,
        movementType,
        reason: reason || undefined,
      };
      await inventoryService.createMovement(payload);
      const updatedProducts = await productsService.list();
      onDone(updatedProducts);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record movement.");
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
        className="glass slide-in w-full max-w-md rounded-2xl inner-border"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-[var(--font-display)] text-base font-semibold" style={{ color: "var(--color-ink)" }}>
            Record Stock Movement
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5" style={{ color: "var(--color-ink-muted)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="modal-label">Product *</label>
            <select className="modal-input" value={productId} onChange={(e) => setProductId(e.target.value)} required>
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku}) — Stock: {p.current_stock}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="modal-label">Movement Type *</label>
            <div className="flex gap-3">
              {(["IN", "OUT"] as MovementType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMovementType(type)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all"
                  style={{
                    background: movementType === type
                      ? type === "IN" ? "var(--color-success-100)" : "var(--color-danger-100)"
                      : "var(--color-glass)",
                    borderColor: movementType === type
                      ? type === "IN" ? "rgba(16,185,129,0.4)" : "rgba(244,63,94,0.4)"
                      : "var(--color-border-strong)",
                    color: movementType === type
                      ? type === "IN" ? "var(--color-success-500)" : "var(--color-danger-500)"
                      : "var(--color-ink-muted)",
                  }}
                >
                  {type === "IN" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  Stock {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="modal-label">Quantity *</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="modal-input"
              required
            />
          </div>

          <div>
            <label className="modal-label">Reason</label>
            <input
              className="modal-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Initial stock load, damaged in transit…"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border px-4 py-3" style={{ background: "var(--color-danger-100)", borderColor: "rgba(244,63,94,0.3)" }}>
              <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "var(--color-danger-500)" }} />
              <p className="text-sm" style={{ color: "var(--color-danger-500)" }}>{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium" style={{ color: "var(--color-ink-muted)", background: "var(--color-glass)" }}>Cancel</button>
            <button type="submit" disabled={loading} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>
              {loading ? "Saving…" : "Record Movement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (p: Product) => void;
}

function AddProductModal({ open, onClose, onCreated }: AddProductModalProps) {
  const [form, setForm] = useState<CreateProductPayload>({
    name: "", sku: "", category: "", unit_price: 0, current_stock: 0, minimum_stock: 0, warehouse_location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof CreateProductPayload, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const product = await productsService.create(form);
      onCreated(product);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass slide-in w-full max-w-lg rounded-2xl inner-border" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="font-[var(--font-display)] text-base font-semibold" style={{ color: "var(--color-ink)" }}>New Product</h2>
          <button onClick={onClose} className="rounded-lg p-1.5" style={{ color: "var(--color-ink-muted)" }}><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="modal-label">Name *</label>
              <input className="modal-input" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Steel Bolt 10mm" />
            </div>
            <div>
              <label className="modal-label">SKU *</label>
              <input className="modal-input" value={form.sku} onChange={(e) => set("sku", e.target.value)} required placeholder="SKU-BOLT-010" />
            </div>
            <div>
              <label className="modal-label">Category</label>
              <input className="modal-input" value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Hardware" />
            </div>
            <div>
              <label className="modal-label">Unit Price (₹) *</label>
              <input className="modal-input" type="number" min={0} step="0.01" value={form.unit_price} onChange={(e) => set("unit_price", Number(e.target.value))} required />
            </div>
            <div>
              <label className="modal-label">Initial Stock</label>
              <input className="modal-input" type="number" min={0} value={form.current_stock ?? 0} onChange={(e) => set("current_stock", Number(e.target.value))} />
            </div>
            <div>
              <label className="modal-label">Minimum Stock</label>
              <input className="modal-input" type="number" min={0} value={form.minimum_stock ?? 0} onChange={(e) => set("minimum_stock", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="modal-label">Warehouse Location</label>
            <input className="modal-input" value={form.warehouse_location ?? ""} onChange={(e) => set("warehouse_location", e.target.value)} placeholder="Warehouse A - Rack 1" />
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
              {loading ? "Creating…" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementModal, setMovementModal] = useState(false);
  const [addProductModal, setAddProductModal] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    productsService.list().then(setProducts).finally(() => setLoading(false));
  }, []);

  const lowStockCount = products.filter((p) => p.current_stock <= p.minimum_stock).length;
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 fade-in">
      <MovementModal
        open={movementModal}
        onClose={() => setMovementModal(false)}
        products={products}
        onDone={setProducts}
      />
      <AddProductModal
        open={addProductModal}
        onClose={() => setAddProductModal(false)}
        onCreated={(p) => setProducts((prev) => [p, ...prev])}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>Inventory</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {products.length} products tracked
            {lowStockCount > 0 && (
              <span style={{ color: "var(--color-danger-500)" }}> · {lowStockCount} low stock</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search SKU or item…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border px-4 py-2.5 text-sm"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)", color: "var(--color-ink)", width: 220 }}
          />
          <button
            onClick={() => setMovementModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ background: "var(--color-accent-100)", color: "var(--color-accent-400)", border: "1px solid var(--color-border)" }}
          >
            <TrendingUp className="h-4 w-4" />
            Record Movement
          </button>
          <button
            onClick={() => setAddProductModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #4338ca)", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
          >
            <Plus className="h-4 w-4" /> New Product
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl inner-border overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        {loading ? (
          <div className="space-y-3 p-6">{[...Array(5)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p style={{ color: "var(--color-ink-muted)" }}>No products found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["SKU", "Product", "Category", "Unit Price", "Stock", "Min. Stock", "Location", "Updated"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-ink-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-glass)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <span className="num text-xs font-medium" style={{ color: "var(--color-accent-400)" }}>{p.sku}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: "var(--color-ink)" }}>{p.name}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs" style={{ color: "var(--color-ink-muted)" }}>{p.category ?? "—"}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="num" style={{ color: "var(--color-ink)" }}>₹{Number(p.unit_price).toLocaleString("en-IN")}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StockBadge current={p.current_stock} min={p.minimum_stock} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="num text-xs" style={{ color: "var(--color-ink-muted)" }}>{p.minimum_stock}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs" style={{ color: "var(--color-ink-muted)" }}>{p.warehouse_location ?? "—"}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="num text-xs" style={{ color: "var(--color-ink-faint)" }}>{formatDate(p.updated_at)}</span>
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
