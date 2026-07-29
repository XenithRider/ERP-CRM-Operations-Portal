-- Mini ERP + CRM Operations Portal
-- Seed / demo data
--
-- Demo login password for ALL seeded users: Password123!
-- (bcrypt hash below corresponds to this password)

---- ---------------------------------------------------------------------
-- Demo users (one per role)
-- ---------------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin User', 'admin@example.com', '$2a$10$mc2PPvqf62k9b01bV8KbJ.5EcwVHbWJIs2P7laGDZ5SF8IXUsA7Vi', 'ADMIN'),
  ('Sales User', 'sales@example.com', '$2a$10$mc2PPvqf62k9b01bV8KbJ.5EcwVHbWJIs2P7laGDZ5SF8IXUsA7Vi', 'SALES'),
  ('Warehouse User', 'warehouse@example.com', '$2a$10$mc2PPvqf62k9b01bV8KbJ.5EcwVHbWJIs2P7laGDZ5SF8IXUsA7Vi', 'WAREHOUSE'),
  ('Accounts User', 'accounts@example.com', '$2a$10$mc2PPvqf62k9b01bV8KbJ.5EcwVHbWJIs2P7laGDZ5SF8IXUsA7Vi', 'ACCOUNTS');

-- ---------------------------------------------------------------------
-- Demo customers
-- ---------------------------------------------------------------------
INSERT INTO customers
  (name, mobile, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes, created_by)
VALUES
  ('Ravi Kumar', '9876543210', 'ravi@retailshop.com', 'Ravi Retail Shop', NULL, 'RETAIL',
   '12 MG Road, Bengaluru', 'ACTIVE', NULL, 'Regular walk-in customer.', 1),
  ('Priya Traders', '9876500000', 'contact@priyatraders.com', 'Priya Traders', '29ABCDE1234F1Z5', 'WHOLESALE',
   'Industrial Area, Pune', 'ACTIVE', '2026-08-15', 'Prefers monthly bulk orders.', 2),
  ('North Star Distribution', '9123456780', 'ops@northstar.com', 'North Star Distribution Pvt Ltd', '27XYZAB5678K1Z2', 'DISTRIBUTOR',
   'Andheri East, Mumbai', 'LEAD', '2026-08-01', 'Interested in becoming a regional distributor.', 2);

-- ---------------------------------------------------------------------
-- Demo products
-- ---------------------------------------------------------------------
INSERT INTO products
  (name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
VALUES
  ('Steel Bolt 10mm', 'SKU-BOLT-010', 'Hardware', 5.50, 500, 100, 'Warehouse A - Rack 1'),
  ('Steel Bolt 12mm', 'SKU-BOLT-012', 'Hardware', 6.75, 40, 50, 'Warehouse A - Rack 1'),
  ('Industrial Paint 5L', 'SKU-PAINT-5L', 'Paints', 850.00, 120, 20, 'Warehouse B - Rack 3'),
  ('Safety Helmet', 'SKU-SAFE-HEL', 'Safety Equipment', 320.00, 15, 10, 'Warehouse C - Rack 2'),
  ('PVC Pipe 2 inch', 'SKU-PIPE-2IN', 'Plumbing', 210.00, 300, 50, 'Warehouse B - Rack 1');

-- ---------------------------------------------------------------------
-- Demo stock movements (initial stock IN entries)
-- ---------------------------------------------------------------------
INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES
  (1, 500, 'IN', 'Initial stock load', 3),
  (2, 100, 'IN', 'Initial stock load', 3),
  (3, 120, 'IN', 'Initial stock load', 3),
  (4, 25, 'IN', 'Initial stock load', 3),
  (5, 300, 'IN', 'Initial stock load', 3);

-- Reflect one OUT movement so warehouse stock levels differ from initial load
INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES
  (2, 60, 'OUT', 'Damaged in transit', 3),
  (4, 10, 'OUT', 'Sample distribution', 3);
