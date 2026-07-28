-- Mini ERP + CRM Operations Portal
-- Database schema (MySQL 8+)

CREATE DATABASE IF NOT EXISTS mini_erp_crm
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_erp_crm;

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(150) NULL,
  business_name VARCHAR(150) NULL,
  gst_number VARCHAR(30) NULL,
  customer_type ENUM('RETAIL', 'WHOLESALE', 'DISTRIBUTOR') NOT NULL DEFAULT 'RETAIL',
  address TEXT NULL,
  status ENUM('LEAD', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'LEAD',
  follow_up_date DATE NULL,
  notes TEXT NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_customers_name (name),
  INDEX idx_customers_mobile (mobile),
  INDEX idx_customers_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- customer_follow_ups
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_follow_ups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  note TEXT NOT NULL,
  follow_up_date DATE NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_follow_ups_customer FOREIGN KEY (customer_id)
    REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT fk_follow_ups_created_by FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_follow_ups_customer (customer_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(60) NOT NULL UNIQUE,
  category VARCHAR(100) NULL,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  current_stock INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL DEFAULT 0,
  warehouse_location VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_products_current_stock_nonneg CHECK (current_stock >= 0),
  CONSTRAINT chk_products_minimum_stock_nonneg CHECK (minimum_stock >= 0),
  INDEX idx_products_name (name),
  INDEX idx_products_category (category)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- stock_movements
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  movement_type ENUM('IN', 'OUT') NOT NULL,
  reason VARCHAR(255) NULL,
  reference_type VARCHAR(50) NULL,
  reference_id INT NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movements_product FOREIGN KEY (product_id)
    REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_movements_created_by FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT chk_movements_quantity_positive CHECK (quantity > 0),
  INDEX idx_movements_product_created (product_id, created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- challans
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  challan_number VARCHAR(40) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  total_quantity INT NOT NULL DEFAULT 0,
  status ENUM('DRAFT', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_challans_customer FOREIGN KEY (customer_id)
    REFERENCES customers (id),
  CONSTRAINT fk_challans_created_by FOREIGN KEY (created_by)
    REFERENCES users (id) ON DELETE SET NULL,
  INDEX idx_challans_status (status),
  INDEX idx_challans_customer (customer_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- challan_items
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS challan_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  challan_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name_snapshot VARCHAR(150) NOT NULL,
  sku_snapshot VARCHAR(60) NOT NULL,
  unit_price_snapshot DECIMAL(12, 2) NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_challan FOREIGN KEY (challan_id)
    REFERENCES challans (id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id)
    REFERENCES products (id),
  CONSTRAINT chk_items_quantity_positive CHECK (quantity > 0),
  INDEX idx_items_challan (challan_id),
  INDEX idx_items_product (product_id)
) ENGINE=InnoDB;
