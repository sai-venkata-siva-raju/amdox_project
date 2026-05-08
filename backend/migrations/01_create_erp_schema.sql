-- Create Amdox ERP Suite Database Schema for PostgreSQL

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Profiles table (modified for PostgreSQL without auth.users dependency)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('superadmin', 'tenantadmin', 'manager', 'viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- KPI Metrics table
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  label text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  module text NOT NULL DEFAULT 'General',
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Seed data for demo tenant
INSERT INTO tenants (id, name, slug) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Amdox Corporation',
  'amdox'
) ON CONFLICT (id) DO NOTHING;

-- Seed a demo user profile
INSERT INTO profiles (id, tenant_id, email, full_name, role) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'admin@amdox.com',
  'System Administrator',
  'superadmin'
) ON CONFLICT (tenant_id, email) DO NOTHING;

-- Seed KPI data
INSERT INTO kpi_metrics (tenant_id, metric_key, metric_value, label) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'total_revenue', 2847500.00, 'Total Revenue'),
  ('a0000000-0000-0000-0000-000000000001', 'active_employees', 1247, 'Active Employees'),
  ('a0000000-0000-0000-0000-000000000001', 'open_purchase_orders', 38, 'Open Purchase Orders'),
  ('a0000000-0000-0000-0000-000000000001', 'pending_approvals', 12, 'Pending Approvals')
ON CONFLICT DO NOTHING;

-- Seed activities
INSERT INTO activities (tenant_id, user_id, action, module) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Invoice #INV-2847 approved for $45,200', 'Finance'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'New employee Sarah Chen onboarded to Engineering', 'HR & Payroll'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Purchase Order PO-1092 created for raw materials', 'Supply Chain'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Project Alpha milestone 3 completed ahead of schedule', 'Projects'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Quarterly budget report generated for Q1 2026', 'Reports'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Vendor contract renewed with TechSupply Inc.', 'Supply Chain'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Payroll batch processed for 1,247 employees', 'HR & Payroll'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Expense claim #EC-4521 submitted by Mark Davis', 'Finance')
ON CONFLICT DO NOTHING;

-- Seed notifications
INSERT INTO notifications (tenant_id, user_id, title, message) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Welcome to Amdox ERP', 'Your account has been created successfully.'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Pending Approvals', 'You have 12 items awaiting your approval.'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'System Update', 'The ERP system has been updated with new features.')
ON CONFLICT DO NOTHING;
