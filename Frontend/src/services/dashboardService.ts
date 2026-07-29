import { customersService } from "./customersService";
import { productsService } from "./productsService";
import { challansService } from "./challansService";
import type { DashboardMetrics } from "@/types";

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const [customers, products, allChallans] = await Promise.all([
      customersService.list(),
      productsService.list(),
      challansService.list(),
    ]);

    const leads = customers.filter((c) => c.status === "LEAD");
    const accounts = customers.filter((c) => c.status === "ACTIVE");
    const draftChallans = allChallans.filter((c) => c.status === "DRAFT");
    const confirmedChallans = allChallans.filter((c) => c.status === "CONFIRMED");
    const lowStockProducts = products.filter(
      (p) => p.current_stock <= p.minimum_stock
    );

    return {
      totalLeads: leads.length,
      totalAccounts: accounts.length,
      totalDraftChallans: draftChallans.length,
      totalConfirmedChallans: confirmedChallans.length,
      lowStockProducts: lowStockProducts.length,
      totalProducts: products.length,
      recentChallans: allChallans.slice(0, 5),
      recentCustomers: customers.slice(0, 5),
    };
  },
};
