import type {
  Account,
  DashboardMetrics,
  Invoice,
  InventoryItem,
  Lead,
  Order,
} from "@/types";

export const mockAccounts: Account[] = [
  { id: "acc-1001", name: "Northbridge Manufacturing", industry: "Industrial", owner: "Priya Nair", status: "active", annualRevenue: 4200000, openDeals: 3, city: "Pune", country: "India", createdAt: "2024-03-11" },
  { id: "acc-1002", name: "Solvex Chemicals", industry: "Chemicals", owner: "Arjun Mehta", status: "at_risk", annualRevenue: 1850000, openDeals: 1, city: "Ahmedabad", country: "India", createdAt: "2023-11-02" },
  { id: "acc-1003", name: "Bluepeak Logistics", industry: "Logistics", owner: "Priya Nair", status: "active", annualRevenue: 2760000, openDeals: 2, city: "Chennai", country: "India", createdAt: "2024-06-19" },
  { id: "acc-1004", name: "Harrow & Vance LLP", industry: "Professional Services", owner: "Devika Rao", status: "pending", annualRevenue: 640000, openDeals: 1, city: "Mumbai", country: "India", createdAt: "2025-01-08" },
  { id: "acc-1005", name: "Cascade Foods Co-op", industry: "F&B", owner: "Arjun Mehta", status: "active", annualRevenue: 980000, openDeals: 0, city: "Nashik", country: "India", createdAt: "2024-09-27" },
  { id: "acc-1006", name: "Iron & Weld Fabricators", industry: "Industrial", owner: "Devika Rao", status: "inactive", annualRevenue: 310000, openDeals: 0, city: "Coimbatore", country: "India", createdAt: "2022-05-14" },
];

export const mockLeads: Lead[] = [
  { id: "ld-501", company: "Northbridge Manufacturing", contact: "Rahul Sinha", email: "rahul.sinha@northbridge.co", stage: "proposal", value: 320000, owner: "Priya Nair", source: "Referral", updatedAt: "2026-07-24" },
  { id: "ld-502", company: "Solvex Chemicals", contact: "Meera Iyer", email: "meera.iyer@solvex.in", stage: "qualified", value: 128000, owner: "Arjun Mehta", source: "Trade Show", updatedAt: "2026-07-22" },
  { id: "ld-503", company: "Fenwick Textiles", contact: "Alok Bansal", email: "alok@fenwicktex.com", stage: "new", value: 74000, owner: "Devika Rao", source: "Website", updatedAt: "2026-07-27" },
  { id: "ld-504", company: "Bluepeak Logistics", contact: "Sana Qureshi", email: "sana.q@bluepeak.io", stage: "contacted", value: 210000, owner: "Priya Nair", source: "Outbound", updatedAt: "2026-07-19" },
  { id: "ld-505", company: "Harrow & Vance LLP", contact: "David Fernandes", email: "d.fernandes@harrowvance.com", stage: "won", value: 96000, owner: "Devika Rao", source: "Referral", updatedAt: "2026-07-15" },
  { id: "ld-506", company: "Cascade Foods Co-op", contact: "Nisha Pillai", email: "nisha@cascadefoods.coop", stage: "lost", value: 54000, owner: "Arjun Mehta", source: "Website", updatedAt: "2026-07-10" },
  { id: "ld-507", company: "Orbit Renewables", contact: "Kabir Malhotra", email: "kabir@orbitrenew.com", stage: "qualified", value: 445000, owner: "Priya Nair", source: "Trade Show", updatedAt: "2026-07-26" },
];

export const mockOrders: Order[] = [
  {
    id: "ord-9001", orderNumber: "SO-20260714-001", account: "Northbridge Manufacturing", status: "processing", total: 128400, currency: "INR", createdAt: "2026-07-14", eta: "2026-08-02",
    lines: [
      { id: "l1", sku: "BRG-2200", description: "Precision bearing assembly", qty: 40, unitPrice: 1860 },
      { id: "l2", sku: "SHF-1100", description: "Steel drive shaft", qty: 12, unitPrice: 3450 },
    ],
  },
  { id: "ord-9002", orderNumber: "SO-20260718-002", account: "Bluepeak Logistics", status: "shipped", total: 54200, currency: "INR", createdAt: "2026-07-18", eta: "2026-07-30", lines: [{ id: "l1", sku: "PLT-0500", description: "Pallet racking unit", qty: 20, unitPrice: 2710 }] },
  { id: "ord-9003", orderNumber: "SO-20260721-003", account: "Solvex Chemicals", status: "confirmed", total: 210500, currency: "INR", createdAt: "2026-07-21", eta: "2026-08-09", lines: [{ id: "l1", sku: "DRM-0200", description: "HDPE storage drum", qty: 100, unitPrice: 2105 }] },
  { id: "ord-9004", orderNumber: "SO-20260710-004", account: "Cascade Foods Co-op", status: "delivered", total: 38900, currency: "INR", createdAt: "2026-07-10", eta: "2026-07-22", lines: [{ id: "l1", sku: "PKG-3300", description: "Food-grade packaging carton", qty: 500, unitPrice: 77.8 }] },
  { id: "ord-9005", orderNumber: "SO-20260725-005", account: "Harrow & Vance LLP", status: "draft", total: 12600, currency: "INR", createdAt: "2026-07-25", eta: "2026-08-05", lines: [{ id: "l1", sku: "SRV-0010", description: "Onboarding service block", qty: 1, unitPrice: 12600 }] },
  { id: "ord-9006", orderNumber: "SO-20260705-006", account: "Northbridge Manufacturing", status: "cancelled", total: 9800, currency: "INR", createdAt: "2026-07-05", eta: "2026-07-15", lines: [{ id: "l1", sku: "BRG-2200", description: "Precision bearing assembly", qty: 4, unitPrice: 2450 }] },
];

export const mockInventory: InventoryItem[] = [
  { id: "inv-1", sku: "BRG-2200", name: "Precision bearing assembly", category: "Components", warehouse: "WH-Pune-1", onHand: 212, reserved: 40, reorderPoint: 150, unitCost: 1240 },
  { id: "inv-2", sku: "SHF-1100", name: "Steel drive shaft", category: "Components", warehouse: "WH-Pune-1", onHand: 34, reserved: 12, reorderPoint: 40, unitCost: 2600 },
  { id: "inv-3", sku: "PLT-0500", name: "Pallet racking unit", category: "Warehouse", warehouse: "WH-Chennai-2", onHand: 8, reserved: 20, reorderPoint: 25, unitCost: 1980 },
  { id: "inv-4", sku: "DRM-0200", name: "HDPE storage drum", category: "Containers", warehouse: "WH-Ahmedabad-1", onHand: 640, reserved: 100, reorderPoint: 200, unitCost: 1450 },
  { id: "inv-5", sku: "PKG-3300", name: "Food-grade packaging carton", category: "Packaging", warehouse: "WH-Nashik-1", onHand: 3200, reserved: 500, reorderPoint: 800, unitCost: 52 },
  { id: "inv-6", sku: "SRV-0010", name: "Onboarding service block", category: "Services", warehouse: "N/A", onHand: 0, reserved: 0, reorderPoint: 0, unitCost: 0 },
];

export const mockInvoices: Invoice[] = [
  { id: "inv-7001", invoiceNumber: "INV-2026-0714", account: "Northbridge Manufacturing", status: "paid", amount: 128400, currency: "INR", issuedAt: "2026-07-14", dueAt: "2026-07-28" },
  { id: "inv-7002", invoiceNumber: "INV-2026-0718", account: "Bluepeak Logistics", status: "sent", amount: 54200, currency: "INR", issuedAt: "2026-07-18", dueAt: "2026-08-01" },
  { id: "inv-7003", invoiceNumber: "INV-2026-0701", account: "Solvex Chemicals", status: "overdue", amount: 96000, currency: "INR", issuedAt: "2026-07-01", dueAt: "2026-07-15" },
  { id: "inv-7004", invoiceNumber: "INV-2026-0710", account: "Cascade Foods Co-op", status: "paid", amount: 38900, currency: "INR", issuedAt: "2026-07-10", dueAt: "2026-07-24" },
  { id: "inv-7005", invoiceNumber: "INV-2026-0726", account: "Harrow & Vance LLP", status: "draft", amount: 12600, currency: "INR", issuedAt: "2026-07-26", dueAt: "2026-08-09" },
];

export const mockDashboard: DashboardMetrics = {
  pipelineValue: 1327000,
  pipelineDelta: 8.4,
  openOrders: 4,
  openOrdersDelta: -2,
  monthRevenue: 218400,
  monthRevenueDelta: 12.1,
  lowStockItems: 2,
  lowStockDelta: 1,
  revenueTrend: [
    { month: "Feb", revenue: 142000, target: 150000 },
    { month: "Mar", revenue: 168000, target: 160000 },
    { month: "Apr", revenue: 155000, target: 165000 },
    { month: "May", revenue: 189000, target: 175000 },
    { month: "Jun", revenue: 201000, target: 190000 },
    { month: "Jul", revenue: 218400, target: 205000 },
  ],
  pipelineByStage: [
    { stage: "New", value: 74000 },
    { stage: "Contacted", value: 210000 },
    { stage: "Qualified", value: 573000 },
    { stage: "Proposal", value: 320000 },
    { stage: "Won", value: 96000 },
  ],
  recentActivity: [
    { id: "a1", type: "order", message: "SO-20260725-005 created for Harrow & Vance LLP", time: "2h ago" },
    { id: "a2", type: "lead", message: "Orbit Renewables moved to Qualified", time: "5h ago" },
    { id: "a3", type: "invoice", message: "INV-2026-0701 is now overdue", time: "1d ago" },
    { id: "a4", type: "account", message: "Solvex Chemicals flagged at risk", time: "1d ago" },
    { id: "a5", type: "order", message: "SO-20260718-002 shipped to Bluepeak Logistics", time: "2d ago" },
  ],
};
