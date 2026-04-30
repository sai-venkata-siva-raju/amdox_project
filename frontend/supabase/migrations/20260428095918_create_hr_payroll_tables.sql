/*
  # Create HR & Payroll Module Tables

  1. New Tables
    - `employees` - Employee master data
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique per tenant)
      - `department` (text)
      - `role` (text, job title)
      - `salary` (numeric, annual salary)
      - `joining_date` (date)
      - `status` (text, Active/On Leave/Terminated)
      - `manager_id` (uuid, self-reference for hierarchy)
      - `phone` (text, nullable)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz)
    - `leave_requests` - Leave management
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `employee_id` (uuid, references employees)
      - `leave_type` (text, Sick/Vacation/Personal/Maternity/Paternity)
      - `start_date` (date)
      - `end_date` (date)
      - `reason` (text)
      - `status` (text, Pending/Approved/Rejected)
      - `approved_by` (uuid, references employees, nullable)
      - `created_at` (timestamptz)
    - `leave_balances` - Annual leave balances
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `employee_id` (uuid, references employees)
      - `year` (integer)
      - `leave_type` (text)
      - `total_days` (integer)
      - `used_days` (numeric, default 0)
    - `payroll_runs` - Payroll batch records
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `month` (text, e.g. "2026-04")
      - `status` (text, Draft/Processed/Approved)
      - `total_gross` (numeric, default 0)
      - `total_deductions` (numeric, default 0)
      - `total_net` (numeric, default 0)
      - `processed_by` (uuid, references profiles, nullable)
      - `processed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
    - `payroll_items` - Individual payroll line items
      - `id` (uuid, primary key)
      - `payroll_run_id` (uuid, references payroll_runs)
      - `employee_id` (uuid, references employees)
      - `gross_pay` (numeric)
      - `federal_tax` (numeric, default 0)
      - `state_tax` (numeric, default 0)
      - `social_security` (numeric, default 0)
      - `medicare` (numeric, default 0)
      - `health_insurance` (numeric, default 0)
      - `retirement_401k` (numeric, default 0)
      - `total_deductions` (numeric, default 0)
      - `net_pay` (numeric, default 0)

  2. Security
    - Enable RLS on all tables
    - Tenant-scoped access with role-based write permissions

  3. Seed Data
    - 12 employees across departments with hierarchy
    - Leave balances for 2026
    - Sample leave requests
*/

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  department text NOT NULL DEFAULT 'General',
  role text NOT NULL DEFAULT 'Employee',
  salary numeric NOT NULL DEFAULT 0,
  joining_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Terminated')),
  manager_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, email)
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read employees in own tenant"
  ON employees FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = employees.tenant_id)
  );

CREATE POLICY "Managers can insert employees"
  ON employees FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = employees.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update employees"
  ON employees FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = employees.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = employees.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL CHECK (leave_type IN ('Sick', 'Vacation', 'Personal', 'Maternity', 'Paternity')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  approved_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read leave requests in own tenant"
  ON leave_requests FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = leave_requests.tenant_id)
  );

CREATE POLICY "Managers can insert leave requests"
  ON leave_requests FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = leave_requests.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update leave requests"
  ON leave_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = leave_requests.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = leave_requests.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- Leave Balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  leave_type text NOT NULL,
  total_days integer NOT NULL DEFAULT 0,
  used_days numeric NOT NULL DEFAULT 0
);

ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read leave balances in own tenant"
  ON leave_balances FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = leave_balances.tenant_id)
  );

CREATE POLICY "Managers can insert leave balances"
  ON leave_balances FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = leave_balances.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update leave balances"
  ON leave_balances FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = leave_balances.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = leave_balances.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- Payroll Runs
CREATE TABLE IF NOT EXISTS payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month text NOT NULL,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Processed', 'Approved')),
  total_gross numeric NOT NULL DEFAULT 0,
  total_deductions numeric NOT NULL DEFAULT 0,
  total_net numeric NOT NULL DEFAULT 0,
  processed_by uuid REFERENCES profiles(id),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, month)
);

ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read payroll runs in own tenant"
  ON payroll_runs FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = payroll_runs.tenant_id)
  );

CREATE POLICY "Managers can insert payroll runs"
  ON payroll_runs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = payroll_runs.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update payroll runs"
  ON payroll_runs FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = payroll_runs.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = payroll_runs.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- Payroll Items
CREATE TABLE IF NOT EXISTS payroll_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id uuid NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  gross_pay numeric NOT NULL DEFAULT 0,
  federal_tax numeric NOT NULL DEFAULT 0,
  state_tax numeric NOT NULL DEFAULT 0,
  social_security numeric NOT NULL DEFAULT 0,
  medicare numeric NOT NULL DEFAULT 0,
  health_insurance numeric NOT NULL DEFAULT 0,
  retirement_401k numeric NOT NULL DEFAULT 0,
  total_deductions numeric NOT NULL DEFAULT 0,
  net_pay numeric NOT NULL DEFAULT 0
);

ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read payroll items in own tenant"
  ON payroll_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM payroll_runs pr
      JOIN profiles p ON p.tenant_id = pr.tenant_id
      WHERE pr.id = payroll_items.payroll_run_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert payroll items"
  ON payroll_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM payroll_runs pr
      JOIN profiles p ON p.tenant_id = pr.tenant_id
      WHERE pr.id = payroll_items.payroll_run_id AND p.id = auth.uid() AND p.role IN ('superadmin', 'tenantadmin', 'manager')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_tenant ON leave_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_tenant ON leave_balances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_tenant ON payroll_runs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);

-- Seed: Employees
INSERT INTO employees (tenant_id, first_name, last_name, email, department, role, salary, joining_date, status, phone) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Sarah', 'Chen', 'sarah.chen@amdox.com', 'Engineering', 'VP Engineering', 185000, '2021-03-15', 'Active', '+1-555-0101'),
  ('a0000000-0000-0000-0000-000000000001', 'Marcus', 'Johnson', 'marcus.j@amdox.com', 'Engineering', 'Senior Developer', 135000, '2022-01-10', 'Active', '+1-555-0102'),
  ('a0000000-0000-0000-0000-000000000001', 'Priya', 'Patel', 'priya.p@amdox.com', 'Engineering', 'Developer', 105000, '2023-06-01', 'Active', '+1-555-0103'),
  ('a0000000-0000-0000-0000-000000000001', 'James', 'Wilson', 'james.w@amdox.com', 'Finance', 'CFO', 195000, '2020-08-20', 'Active', '+1-555-0104'),
  ('a0000000-0000-0000-0000-000000000001', 'Emily', 'Rodriguez', 'emily.r@amdox.com', 'Finance', 'Financial Analyst', 92000, '2023-02-14', 'Active', '+1-555-0105'),
  ('a0000000-0000-0000-0000-000000000001', 'David', 'Kim', 'david.k@amdox.com', 'Sales', 'VP Sales', 175000, '2021-05-01', 'Active', '+1-555-0106'),
  ('a0000000-0000-0000-0000-000000000001', 'Lisa', 'Thompson', 'lisa.t@amdox.com', 'Sales', 'Account Executive', 95000, '2023-09-15', 'Active', '+1-555-0107'),
  ('a0000000-0000-0000-0000-000000000001', 'Robert', 'Garcia', 'robert.g@amdox.com', 'HR', 'HR Director', 130000, '2020-11-01', 'Active', '+1-555-0108'),
  ('a0000000-0000-0000-0000-000000000001', 'Amanda', 'Foster', 'amanda.f@amdox.com', 'HR', 'HR Specialist', 78000, '2024-01-08', 'Active', '+1-555-0109'),
  ('a0000000-0000-0000-0000-000000000001', 'Michael', 'Chang', 'michael.c@amdox.com', 'Operations', 'Operations Manager', 120000, '2022-04-20', 'Active', '+1-555-0110'),
  ('a0000000-0000-0000-0000-000000000001', 'Rachel', 'Adams', 'rachel.a@amdox.com', 'Marketing', 'Marketing Manager', 110000, '2022-07-15', 'On Leave', '+1-555-0111'),
  ('a0000000-0000-0000-0000-000000000001', 'Tom', 'Martinez', 'tom.m@amdox.com', 'Engineering', 'Junior Developer', 75000, '2024-03-01', 'Active', '+1-555-0112')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Set up manager hierarchy
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'sarah.chen@amdox.com') WHERE email IN ('marcus.j@amdox.com', 'priya.p@amdox.com', 'tom.m@amdox.com');
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'james.w@amdox.com') WHERE email IN ('emily.r@amdox.com');
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'david.k@amdox.com') WHERE email IN ('lisa.t@amdox.com');
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'robert.g@amdox.com') WHERE email IN ('amanda.f@amdox.com');
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'michael.c@amdox.com') WHERE email IN ('rachel.a@amdox.com');

-- Seed: Leave Balances for 2026
INSERT INTO leave_balances (tenant_id, employee_id, year, leave_type, total_days, used_days)
SELECT e.tenant_id, e.id, 2026, 'Vacation', 20, 5
FROM employees e WHERE e.tenant_id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO leave_balances (tenant_id, employee_id, year, leave_type, total_days, used_days)
SELECT e.tenant_id, e.id, 2026, 'Sick', 10, 2
FROM employees e WHERE e.tenant_id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO leave_balances (tenant_id, employee_id, year, leave_type, total_days, used_days)
SELECT e.tenant_id, e.id, 2026, 'Personal', 3, 0
FROM employees e WHERE e.tenant_id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- Seed: Leave Requests
INSERT INTO leave_requests (tenant_id, employee_id, leave_type, start_date, end_date, reason, status)
SELECT e.tenant_id, e.id, 'Vacation', '2026-04-14', '2026-04-18', 'Family trip', 'Approved'
FROM employees e WHERE e.email = 'marcus.j@amdox.com' AND e.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO leave_requests (tenant_id, employee_id, leave_type, start_date, end_date, reason, status)
SELECT e.tenant_id, e.id, 'Sick', '2026-04-22', '2026-04-23', 'Feeling unwell', 'Approved'
FROM employees e WHERE e.email = 'priya.p@amdox.com' AND e.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO leave_requests (tenant_id, employee_id, leave_type, start_date, end_date, reason, status)
SELECT e.tenant_id, e.id, 'Personal', '2026-05-05', '2026-05-05', 'Personal matters', 'Pending'
FROM employees e WHERE e.email = 'lisa.t@amdox.com' AND e.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO leave_requests (tenant_id, employee_id, leave_type, start_date, end_date, reason, status)
SELECT e.tenant_id, e.id, 'Vacation', '2026-05-12', '2026-05-16', 'Summer vacation', 'Pending'
FROM employees e WHERE e.email = 'amanda.f@amdox.com' AND e.tenant_id = 'a0000000-0000-0000-0000-000000000001';

-- Seed: Payroll Run for 2026-04
INSERT INTO payroll_runs (tenant_id, month, status, total_gross, total_deductions, total_net)
VALUES ('a0000000-0000-0000-0000-000000000001', '2026-04', 'Processed', 118333, 33133, 85200)
ON CONFLICT (tenant_id, month) DO NOTHING;
