/*
  # Create Amdox ERP Suite Database Schema

  1. New Tables
    - `tenants` - Multi-tenant organizations
      - `id` (uuid, primary key)
      - `name` (text, organization name)
      - `slug` (text, unique URL slug)
      - `created_at` (timestamp)
    - `profiles` - User profiles linked to tenants
      - `id` (uuid, primary key, references auth.users)
      - `tenant_id` (uuid, references tenants)
      - `full_name` (text)
      - `avatar_url` (text, nullable)
      - `role` (text, default 'employee')
      - `created_at` (timestamp)
    - `kpi_metrics` - Dashboard KPI data per tenant
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `metric_key` (text, e.g. 'total_revenue')
      - `metric_value` (numeric)
      - `label` (text)
      - `updated_at` (timestamp)
    - `activities` - Recent activity feed entries
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `user_id` (uuid, references profiles, nullable)
      - `action` (text, description of activity)
      - `module` (text, e.g. 'Finance', 'HR')
      - `created_at` (timestamp)
    - `notifications` - User notifications
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `message` (text)
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies restrict access to authenticated users within their tenant

  3. Seed Data
    - Demo tenant "Amdox Corporation"
    - 4 KPI metrics for dashboard
    - 8 activity feed entries
*/

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tenants"
  ON tenants FOR SELECT
  TO authenticated
  USING (true);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  role text NOT NULL DEFAULT 'employee',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read profiles in own tenant"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.tenant_id = profiles.tenant_id
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- KPI Metrics table
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  label text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read KPIs in own tenant"
  ON kpi_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = kpi_metrics.tenant_id
    )
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

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read activities in own tenant"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = activities.tenant_id
    )
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

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Seed data for demo tenant
INSERT INTO tenants (id, name, slug) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Amdox Corporation',
  'amdox'
) ON CONFLICT (id) DO NOTHING;

-- Seed KPI data
INSERT INTO kpi_metrics (tenant_id, metric_key, metric_value, label) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'total_revenue', 2847500.00, 'Total Revenue'),
  ('a0000000-0000-0000-0000-000000000001', 'active_employees', 1247, 'Active Employees'),
  ('a0000000-0000-0000-0000-000000000001', 'open_purchase_orders', 38, 'Open Purchase Orders'),
  ('a0000000-0000-0000-0000-000000000001', 'pending_approvals', 12, 'Pending Approvals')
ON CONFLICT DO NOTHING;

-- Seed activities
INSERT INTO activities (tenant_id, action, module) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Invoice #INV-2847 approved for $45,200', 'Finance'),
  ('a0000000-0000-0000-0000-000000000001', 'New employee Sarah Chen onboarded to Engineering', 'HR & Payroll'),
  ('a0000000-0000-0000-0000-000000000001', 'Purchase Order PO-1092 created for raw materials', 'Supply Chain'),
  ('a0000000-0000-0000-0000-000000000001', 'Project Alpha milestone 3 completed ahead of schedule', 'Projects'),
  ('a0000000-0000-0000-0000-000000000001', 'Quarterly budget report generated for Q1 2026', 'Reports'),
  ('a0000000-0000-0000-0000-000000000001', 'Vendor contract renewed with TechSupply Inc.', 'Supply Chain'),
  ('a0000000-0000-0000-0000-000000000001', 'Payroll batch processed for 1,247 employees', 'HR & Payroll'),
  ('a0000000-0000-0000-0000-000000000001', 'Expense claim #EC-4521 submitted by Mark Davis', 'Finance')
ON CONFLICT DO NOTHING;
