/*
  # Create Supply Chain & Inventory Module Tables

  1. New Tables
    - `vendors` - Vendor/supplier master
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `name` (text)
      - `contact_name` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `rating` (integer, 1-5, default 3)
      - `status` (text, Active/Inactive, default Active)
      - `created_at` (timestamptz)
    - `products` - Inventory items / SKUs
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `sku` (text, unique per tenant)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `unit_price` (numeric)
      - `quantity_on_hand` (integer, default 0)
      - `reorder_point` (integer, default 0)
      - `warehouse_location` (text)
      - `created_at` (timestamptz)
    - `purchase_orders` - PO headers
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `po_number` (text, unique per tenant)
      - `vendor_id` (uuid, references vendors)
      - `status` (text, Draft/Submitted/Approved/Received/Closed/Rejected)
      - `total_amount` (numeric, default 0)
      - `notes` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
    - `purchase_order_lines` - PO line items
      - `id` (uuid, primary key)
      - `purchase_order_id` (uuid, references purchase_orders)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `unit_price` (numeric)
      - `total` (numeric)
    - `stock_adjustments` - Inventory adjustments
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `product_id` (uuid, references products)
      - `adjustment_type` (text, In/Out)
      - `quantity` (integer)
      - `reason` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Tenant-scoped access with role-based write

  3. Seed Data
    - 6 vendors with ratings
    - 10 products/SKUs with stock levels
    - 4 purchase orders with line items
*/

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read vendors in own tenant"
  ON vendors FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = vendors.tenant_id));

CREATE POLICY "Managers can insert vendors"
  ON vendors FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = vendors.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

CREATE POLICY "Managers can update vendors"
  ON vendors FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = vendors.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = vendors.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  unit_price numeric NOT NULL DEFAULT 0,
  quantity_on_hand integer NOT NULL DEFAULT 0,
  reorder_point integer NOT NULL DEFAULT 10,
  warehouse_location text NOT NULL DEFAULT 'WH-A',
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, sku)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read products in own tenant"
  ON products FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = products.tenant_id));

CREATE POLICY "Managers can insert products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = products.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

CREATE POLICY "Managers can update products"
  ON products FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = products.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = products.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  po_number text NOT NULL,
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Received', 'Closed', 'Rejected')),
  total_amount numeric NOT NULL DEFAULT 0,
  notes text NOT NULL DEFAULT '',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, po_number)
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read POs in own tenant"
  ON purchase_orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = purchase_orders.tenant_id));

CREATE POLICY "Managers can insert POs"
  ON purchase_orders FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = purchase_orders.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

CREATE POLICY "Managers can update POs"
  ON purchase_orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = purchase_orders.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = purchase_orders.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

-- PO Lines
CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0
);

ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read PO lines in own tenant"
  ON purchase_order_lines FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM purchase_orders po
    JOIN profiles p ON p.tenant_id = po.tenant_id
    WHERE po.id = purchase_order_lines.purchase_order_id AND p.id = auth.uid()
  ));

CREATE POLICY "Managers can insert PO lines"
  ON purchase_order_lines FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM purchase_orders po
    JOIN profiles p ON p.tenant_id = po.tenant_id
    WHERE po.id = purchase_order_lines.purchase_order_id AND p.id = auth.uid() AND p.role IN ('superadmin', 'tenantadmin', 'manager')
  ));

-- Stock Adjustments
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('In', 'Out')),
  quantity integer NOT NULL CHECK (quantity > 0),
  reason text NOT NULL DEFAULT '',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read stock adjustments in own tenant"
  ON stock_adjustments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = stock_adjustments.tenant_id));

CREATE POLICY "Managers can insert stock adjustments"
  ON stock_adjustments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = stock_adjustments.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_tenant ON vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_po_tenant ON purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pol_po ON purchase_order_lines(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_tenant ON stock_adjustments(tenant_id);

-- Seed: Vendors
INSERT INTO vendors (tenant_id, name, contact_name, email, phone, rating, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'TechSupply Inc.', 'Mike Torres', 'mike@techsupply.com', '+1-555-2001', 5, 'Active'),
  ('a0000000-0000-0000-0000-000000000001', 'GlobalParts Ltd.', 'Anna Klein', 'anna@globalparts.com', '+1-555-2002', 4, 'Active'),
  ('a0000000-0000-0000-0000-000000000001', 'FastFreight Ltd.', 'Carlos Diaz', 'carlos@fastfreight.com', '+1-555-2003', 3, 'Active'),
  ('a0000000-0000-0000-0000-000000000001', 'PrimeMaterials Co.', 'Sarah Wood', 'sarah@primematerials.com', '+1-555-2004', 5, 'Active'),
  ('a0000000-0000-0000-0000-000000000001', 'EcoPack Solutions', 'David Lee', 'david@ecopack.com', '+1-555-2005', 4, 'Active'),
  ('a0000000-0000-0000-0000-000000000001', 'Omega Components', 'Lisa Brown', 'lisa@omegacomponents.com', '+1-555-2006', 2, 'Inactive');

-- Seed: Products
INSERT INTO products (tenant_id, sku, name, description, category, unit_price, quantity_on_hand, reorder_point, warehouse_location) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'SKU-001', 'Server Rack Unit', '42U server rack enclosure', 'Hardware', 2450.00, 18, 5, 'WH-A-A1'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-002', 'SSD 1TB Enterprise', 'NVMe SSD enterprise grade', 'Hardware', 189.00, 45, 20, 'WH-A-B2'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-003', 'Cat6 Ethernet Cable', '1000ft bulk Cat6 cable', 'Networking', 125.00, 8, 15, 'WH-B-C1'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-004', 'UPS Battery 3000VA', 'Uninterruptible power supply', 'Hardware', 890.00, 12, 5, 'WH-A-A3'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-005', 'Network Switch 48-Port', 'Managed L2 switch', 'Networking', 1250.00, 3, 5, 'WH-B-D1'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-006', 'Thermal Paste Tube', 'High-performance thermal compound', 'Accessories', 12.50, 200, 50, 'WH-C-E1'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-007', 'RAM DDR5 32GB', 'ECC registered memory module', 'Hardware', 320.00, 4, 10, 'WH-A-B1'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-008', 'Fiber Optic Patch Cable', 'LC-LC 3m single-mode', 'Networking', 28.00, 60, 25, 'WH-B-C2'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-009', 'Rack PDU 30A', 'Intelligent power distribution', 'Hardware', 575.00, 7, 5, 'WH-A-A2'),
  ('a0000000-0000-0000-0000-000000000001', 'SKU-010', 'Cable Management Tray', '2ft metal cable tray', 'Accessories', 34.00, 2, 10, 'WH-C-E2')
ON CONFLICT (tenant_id, sku) DO NOTHING;

-- Seed: Purchase Orders
INSERT INTO purchase_orders (tenant_id, po_number, vendor_id, status, total_amount, notes) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'PO-3001', (SELECT id FROM vendors WHERE name = 'TechSupply Inc.' AND tenant_id = 'a0000000-0000-0000-0000-000000000001'), 'Approved', 9800.00, 'Q2 server hardware restock'),
  ('a0000000-0000-0000-0000-000000000001', 'PO-3002', (SELECT id FROM vendors WHERE name = 'GlobalParts Ltd.' AND tenant_id = 'a0000000-0000-0000-0000-000000000001'), 'Submitted', 3200.00, 'Networking components'),
  ('a0000000-0000-0000-0000-000000000001', 'PO-3003', (SELECT id FROM vendors WHERE name = 'PrimeMaterials Co.' AND tenant_id = 'a0000000-0000-0000-0000-000000000001'), 'Draft', 1500.00, 'Accessory restock'),
  ('a0000000-0000-0000-0000-000000000001', 'PO-3004', (SELECT id FROM vendors WHERE name = 'EcoPack Solutions' AND tenant_id = 'a0000000-0000-0000-0000-000000000001'), 'Received', 5600.00, 'Packaging materials Q2')
ON CONFLICT (tenant_id, po_number) DO NOTHING;

-- Seed: PO Lines
INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity, unit_price, total)
SELECT po.id, p.id, 4, 2450.00, 9800.00
FROM purchase_orders po, products p
WHERE po.po_number = 'PO-3001' AND p.sku = 'SKU-001' AND po.tenant_id = 'a0000000-0000-0000-0000-000000000001' AND p.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity, unit_price, total)
SELECT po.id, p.id, 10, 320.00, 3200.00
FROM purchase_orders po, products p
WHERE po.po_number = 'PO-3002' AND p.sku = 'SKU-007' AND po.tenant_id = 'a0000000-0000-0000-0000-000000000001' AND p.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity, unit_price, total)
SELECT po.id, p.id, 20, 12.50, 250.00
FROM purchase_orders po, products p
WHERE po.po_number = 'PO-3003' AND p.sku = 'SKU-006' AND po.tenant_id = 'a0000000-0000-0000-0000-000000000001' AND p.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity, unit_price, total)
SELECT po.id, p.id, 50, 28.00, 1400.00
FROM purchase_orders po, products p
WHERE po.po_number = 'PO-3003' AND p.sku = 'SKU-008' AND po.tenant_id = 'a0000000-0000-0000-0000-000000000001' AND p.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity, unit_price, total)
SELECT po.id, p.id, 10, 560.00, 5600.00
FROM purchase_orders po, products p
WHERE po.po_number = 'PO-3004' AND p.sku = 'SKU-009' AND po.tenant_id = 'a0000000-0000-0000-0000-000000000001' AND p.tenant_id = 'a0000000-0000-0000-0000-000000000001';
