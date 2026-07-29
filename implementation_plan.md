# Alignment of Frontend with Backend REST APIs & Overhauling the UI

This plan outlines the changes required to fully wire the frontend to the backend REST API (which has `/customers`, `/products`, `/inventory/movements`, and `/challans` endpoints) and completely replace the client-side mocks with real database queries. It also covers updating the visual design to a premium, modern theme with rich aesthetics.

## User Review Required

> [!IMPORTANT]
> The backend database structure differs slightly from the frontend mock schema:
> - **Leads & Accounts** are stored together in the `customers` table, distinguished by `status` (`'LEAD'` vs `'ACTIVE'`).
> - **Orders & Invoices** are represented by the `challans` table, where a confirmed challan serves as an invoice (which can be exported to PDF).
> - **Inventory** is represented by the `products` table, with stock movements logged in `stock_movements`.
>
> We will map the frontend pages directly to these tables to make all features work in real-time.

## Open Questions

- Should we allow creating new Products and Inventory stock movements directly from the Inventory UI? The current prototype only shows a list, but adding the ability to record movements (using `POST /api/inventory/movements`) would make the backend feature fully accessible.
- We will add interactive modals for creating a Customer (Lead/Account) and a Delivery Challan (Order) so that full creation/update capabilities are supported.

## Proposed Changes

### Frontend Services

#### [MODIFY] [leadsService.ts](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/services/leadsService.ts)
- Update `list` to fetch from `GET /customers?status=LEAD`
- Update `getById` to fetch from `GET /customers/:id`
- Update `create` to use `POST /customers`
- Update `updateStage` to use `PUT /customers/:id` (updating the status/follow_up_date)

#### [MODIFY] [accountsService.ts](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/services/accountsService.ts)
- Update `list` to fetch from `GET /customers?status=ACTIVE`
- Update `getById` to fetch from `GET /customers/:id`
- Update `create` to use `POST /customers`

#### [MODIFY] [inventoryService.ts](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/services/inventoryService.ts)
- Update `list` to fetch from `GET /products`
- Add `create` to use `POST /products`
- Add `createMovement` to use `POST /inventory/movements`

#### [MODIFY] [ordersService.ts](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/services/ordersService.ts)
- Update `list` to fetch from `GET /challans`
- Update `getById` to fetch from `GET /challans/:id`
- Add `create` to use `POST /challans`
- Add `confirm` to use `POST /challans/:id/confirm`
- Add `cancel` to use `POST /challans/:id/cancel`

#### [MODIFY] [invoicesService.ts](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/services/invoicesService.ts)
- Update `list` to fetch from `GET /challans?status=CONFIRMED`
- Add `downloadInvoice` to fetch PDF from `GET /challans/:id/invoice`

#### [MODIFY] [dashboardService.ts](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/services/dashboardService.ts)
- Query `/customers`, `/products`, and `/challans` asynchronously to compile live metrics (e.g., counting low stock items, counting orders, calculating total pipeline values) instead of using mock data.

---

### Frontend Components & Pages

#### [MODIFY] [Leads.tsx](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/pages/Leads.tsx)
- Wire it to the new `leadsService`. Add UI inputs to edit details, add follow-ups (`POST /customers/:id/follow-ups`), and create new leads.

#### [MODIFY] [Accounts.tsx](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/pages/Accounts.tsx)
- Wire it to `accountsService` to show active accounts. Add customer-creation capabilities.

#### [MODIFY] [Orders.tsx](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/pages/Orders.tsx)
- Overhaul to support creating order/challan (mapping products and quantities), selecting the customer, viewing the details of a challan, and confirming/cancelling the order.

#### [MODIFY] [Inventory.tsx](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/pages/Inventory.tsx)
- Overhaul to show actual product data. Add a modal to log stock movements (IN/OUT) and update stock levels.

#### [MODIFY] [Invoices.tsx](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/pages/Invoices.tsx)
- Overhaul to show confirmed challans. Add a "Download PDF" action that calls the backend invoice API and triggers a file download.

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/pages/Dashboard.tsx)
- Display the computed live metrics with charts.

#### [MODIFY] [index.css](file:///c:/Users/sumit/Desktop/FundsRoom-Assignment/Frontend/src/index.css)
- Revamp stylesheets to introduce a highly premium dark/glassmorphic look with vibrant accents, fluid animations, and Google Fonts.

## Verification Plan

### Automated Tests
- Run `npm run build` in the frontend directory to ensure TypeScript compilation passes.

### Manual Verification
- Access the frontend dashboard local link `http://localhost:5173`.
- Perform Login using `admin@example.com` / `Password123!`.
- Verify pages (Leads, Accounts, Orders, Inventory, Invoices) load live data from the database.
- Create a Lead, add a follow-up, convert it to active status.
- Add inventory, record a stock movement.
- Create a challan in draft, click "Confirm", check if stock decreases.
- Click "Download PDF" on a confirmed challan and verify the PDF is generated and downloaded correctly.
