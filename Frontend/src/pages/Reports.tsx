import { useEffect, useState } from "react";
import { challansService } from "@/services/challansService";
import { customersService } from "@/services/customersService";
import { productsService } from "@/services/productsService";
import type { Challan, Customer, Product } from "@/types";
import { formatDate } from "@/lib/format";

export function Reports() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      challansService.list(),
      customersService.list(),
      productsService.list(),
    ])
      .then(([c, cu, p]) => {
        setChallans(c);
        setCustomers(cu);
        setProducts(p);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-36 shimmer rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 shimmer rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const totalLeads = customers.filter((c) => c.status === "LEAD").length;
  const totalAccounts = customers.filter((c) => c.status === "ACTIVE").length;
  const totalDraft = challans.filter((c) => c.status === "DRAFT").length;
  const totalConfirmed = challans.filter((c) => c.status === "CONFIRMED").length;
  const totalCancelled = challans.filter((c) => c.status === "CANCELLED").length;
  const lowStock = products.filter((p) => p.current_stock <= p.minimum_stock).length;

  const summaryCards = [
    { label: "Total Customers", value: customers.length, color: "var(--color-accent-500)" },
    { label: "Leads", value: totalLeads, color: "var(--color-warning-500)" },
    { label: "Active Accounts", value: totalAccounts, color: "var(--color-success-500)" },
    { label: "Draft Orders", value: totalDraft, color: "var(--color-accent-400)" },
    { label: "Confirmed Orders", value: totalConfirmed, color: "var(--color-success-500)" },
    { label: "Cancelled Orders", value: totalCancelled, color: "var(--color-danger-500)" },
    { label: "Total Products", value: products.length, color: "var(--color-accent-500)" },
    { label: "Low Stock Items", value: lowStock, color: "var(--color-danger-500)" },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="font-[var(--font-display)] text-2xl font-bold tracking-tight" style={{ color: "var(--color-ink)" }}>
          Reports
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Summary of operations across CRM and ERP.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((s) => (
          <div
            key={s.label}
            className="glass rounded-2xl inner-border p-5"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-ink-muted)" }}>
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-bold font-[var(--font-display)]" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Challans Table */}
      <div className="glass rounded-2xl inner-border overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>All Challans</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Challan #", "Customer", "Qty", "Status", "Created"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-ink-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {challans.map((c) => (
              <tr
                key={c.id}
                style={{ borderBottom: "1px solid var(--color-border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-glass)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td className="px-5 py-3.5">
                  <span className="num font-semibold" style={{ color: "var(--color-accent-400)" }}>{c.challan_number}</span>
                </td>
                <td className="px-5 py-3.5" style={{ color: "var(--color-ink)" }}>{c.customer_name}</td>
                <td className="px-5 py-3.5">
                  <span className="num" style={{ color: "var(--color-ink-muted)" }}>{c.total_quantity}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="badge"
                    style={{
                      background: c.status === "CONFIRMED" ? "var(--color-success-100)" : c.status === "CANCELLED" ? "var(--color-danger-100)" : "var(--color-warning-100)",
                      color: c.status === "CONFIRMED" ? "var(--color-success-500)" : c.status === "CANCELLED" ? "var(--color-danger-500)" : "var(--color-warning-500)",
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="num text-xs" style={{ color: "var(--color-ink-faint)" }}>{formatDate(c.created_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
