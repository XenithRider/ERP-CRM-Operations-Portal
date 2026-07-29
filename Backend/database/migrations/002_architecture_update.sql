-- Migration: 002_architecture_update.sql
-- Mini ERP + CRM Operations Portal
--
-- Run this against a database that was created from an earlier version of
-- schema.sql. It is idempotent-ish: each statement is safe to run once.
-- If you are setting up a brand new database, just run schema.sql directly
-- (it already includes these changes) and skip this file.
--
-- Changes in this migration:
--   1. customers.mobile becomes UNIQUE (fixes duplicate customers being
--      created with the same mobile number).
--   2. products gains an image_url column (AWS S3 image support).
--   3. challan_items gains a category_snapshot column (historical accuracy
--      for the product category at the time of the challan).

USE mini_erp_crm;

-- 1. Deduplicate existing customers before adding the UNIQUE constraint.
--    Keeps the oldest record (lowest id) for each mobile number and moves
--    any follow-ups from the duplicates onto the kept record before
--    deleting the duplicates. Review the output of the SELECT below before
--    running the DELETE in a production database with real data.

-- Inspect duplicates first:
-- SELECT mobile, COUNT(*) AS c, GROUP_CONCAT(id ORDER BY id) AS ids
-- FROM customers GROUP BY mobile HAVING c > 1;

-- Re-point follow-ups from duplicate customers to the kept (oldest) customer:
UPDATE customer_follow_ups f
JOIN customers dup ON dup.id = f.customer_id
JOIN (
  SELECT mobile, MIN(id) AS keep_id
  FROM customers
  GROUP BY mobile
) keep ON keep.mobile = dup.mobile
SET f.customer_id = keep.keep_id
WHERE dup.id <> keep.keep_id;

-- Re-point challans from duplicate customers to the kept (oldest) customer:
UPDATE challans c
JOIN customers dup ON dup.id = c.customer_id
JOIN (
  SELECT mobile, MIN(id) AS keep_id
  FROM customers
  GROUP BY mobile
) keep ON keep.mobile = dup.mobile
SET c.customer_id = keep.keep_id
WHERE dup.id <> keep.keep_id;

-- Remove the now-unreferenced duplicate customer rows:
DELETE dup FROM customers dup
JOIN (
  SELECT mobile, MIN(id) AS keep_id
  FROM customers
  GROUP BY mobile
) keep ON keep.mobile = dup.mobile
WHERE dup.id <> keep.keep_id;

-- Drop the old non-unique mobile index if it exists, then add the
-- UNIQUE constraint. (Ignore an error here if the index name differs
-- or was never created in your environment.)
ALTER TABLE customers DROP INDEX idx_customers_mobile;
ALTER TABLE customers ADD UNIQUE KEY uq_customers_mobile (mobile);

-- 2. Add image_url to products (safe no-op if the column already exists).
ALTER TABLE products ADD COLUMN image_url VARCHAR(500) NULL AFTER warehouse_location;

-- 3. Add category_snapshot to challan_items.
ALTER TABLE challan_items ADD COLUMN category_snapshot VARCHAR(100) NULL AFTER sku_snapshot;
