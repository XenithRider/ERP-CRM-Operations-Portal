// ---- Shared/domain types for the ERP-CRM Operations Portal ----
// These mirror typical ERP/CRM REST resources. Field names use camelCase
// on the frontend; services/*.ts is the single place that maps the real
// backend response shape (e.g. Spring Boot / SAP-integrated snake_case)
// into these types, so only that layer needs to change once the actual
// API contract from the backend repo is available.

export type ID = string;

export type Status = "active" | "pending" | "at_risk" | "inactive" | "closed";

export interface User {
  id: ID;
  name: string;
  email: string;
  role: "admin" | "manager" | "sales" | "ops" | "viewer";
  avatarInitials: string;
}

export interface Account {
  id: ID;
  name: string;
  industry: string;
  owner: string;
  status: Status;
  annualRevenue: number;
  openDeals: number;
  city: string;
  country: string;
  createdAt: string;
}

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export interface Lead {
  id: ID;
  company: string;
  contact: string;
  email: string;
  stage: LeadStage;
  value: number;
  owner: string;
  source: string;
  updatedAt: string;
}

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderLine {
  id: ID;
  sku: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: ID;
  orderNumber: string;
  account: string;
  status: OrderStatus;
  total: number;
  currency: string;
  createdAt: string;
  eta: string;
  lines: OrderLine[];
}

export interface InventoryItem {
  id: ID;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  unitCost: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface Invoice {
  id: ID;
  invoiceNumber: string;
  account: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  issuedAt: string;
  dueAt: string;
}

export interface DashboardMetrics {
  pipelineValue: number;
  pipelineDelta: number;
  openOrders: number;
  openOrdersDelta: number;
  monthRevenue: number;
  monthRevenueDelta: number;
  lowStockItems: number;
  lowStockDelta: number;
  revenueTrend: { month: string; revenue: number; target: number }[];
  pipelineByStage: { stage: string; value: number }[];
  recentActivity: {
    id: ID;
    type: "lead" | "order" | "invoice" | "account";
    message: string;
    time: string;
  }[];
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
