// ---- Shared/domain types for the ERP-CRM Operations Portal ----
// These mirror the backend REST API response shapes from the backend repo.

export type ID = string | number;

// ---- Auth ----
export interface User {
  id: ID;
  name: string;
  email: string;
  role: "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS" | string;
  avatarInitials?: string;
}

// ---- Customer (Leads & Accounts) ----
export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";
export type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";

export interface Customer {
  id: ID;
  name: string;
  mobile: string;
  email?: string | null;
  business_name?: string | null;
  gst_number?: string | null;
  customer_type: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  follow_up_date?: string | null;
  notes?: string | null;
  created_by?: ID | null;
  created_at: string;
  updated_at: string;
  followUps?: FollowUp[];
}

export interface FollowUp {
  id: ID;
  customer_id?: ID;
  note: string;
  follow_up_date?: string | null;
  created_by?: ID | null;
  created_at: string;
}

export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

// ---- Product ----
export interface Product {
  id: ID;
  name: string;
  sku: string;
  category?: string | null;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  warehouse_location?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  category?: string;
  unit_price: number;
  current_stock?: number;
  minimum_stock?: number;
  warehouse_location?: string;
}

// ---- Inventory / Stock Movements ----
export type MovementType = "IN" | "OUT";

export interface StockMovement {
  id: ID;
  product_id: ID;
  quantity: number;
  movement_type: MovementType;
  reason?: string | null;
  reference_type?: string | null;
  reference_id?: ID | null;
  created_by?: ID | null;
  created_at: string;
  product_name?: string;
  product_sku?: string;
}

export interface CreateMovementPayload {
  productId: ID;
  quantity: number;
  movementType: MovementType;
  reason?: string;
}

// ---- Challans (Orders & Invoices) ----
export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface ChallanItem {
  id: ID;
  challan_id: ID;
  product_id: ID;
  product_name_snapshot: string;
  sku_snapshot: string;
  category_snapshot?: string | null;
  unit_price_snapshot: number;
  quantity: number;
}

export interface Challan {
  id: ID;
  challan_number: string;
  customer_id: ID;
  customer_name: string;
  customer_mobile: string;
  total_quantity: number;
  status: ChallanStatus;
  created_by?: ID | null;
  created_at: string;
  updated_at: string;
  items?: ChallanItem[];
}

export interface CreateChallanPayload {
  customerId: ID;
  items: { productId: ID; quantity: number }[];
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- API Response Wrapper ----
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- Dashboard ----
export interface DashboardMetrics {
  totalLeads: number;
  totalAccounts: number;
  totalDraftChallans: number;
  totalConfirmedChallans: number;
  lowStockProducts: number;
  totalProducts: number;
  recentChallans: Challan[];
  recentCustomers: Customer[];
}
