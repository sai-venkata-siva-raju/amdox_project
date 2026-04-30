/*
  # Create Finance Module Tables

  1. New Tables
    - `chart_of_accounts` - General ledger account master
    - `journal_entries` - Journal entry headers
    - `journal_entry_lines` - Individual debit/credit lines
    - `ap_invoices` - Accounts Payable vendor invoices
    - `ar_invoices` - Accounts Receivable customer invoices
    - `ar_payments` - Customer payment records
    - `fiscal_periods` - Period management for close

  2. Security
    - Enable RLS on all tables
    - Users can only access data within their tenant
    - Only TenantAdmin/Manager can insert/update/delete

  3. Seed Data
    - Sample chart of accounts, AP/AR invoices, journal entries
*/

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  account_code text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
  balance numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, account_code)
);

ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read accounts in own tenant"
  ON chart_of_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = chart_of_accounts.tenant_id)
  );

CREATE POLICY "Managers can insert accounts"
  ON chart_of_accounts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = chart_of_accounts.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update accounts"
  ON chart_of_accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = chart_of_accounts.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = chart_of_accounts.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entry_number text NOT NULL,
  description text NOT NULL DEFAULT '',
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  period text NOT NULL,
  is_posted boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, entry_number)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read journal entries in own tenant"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = journal_entries.tenant_id)
  );

CREATE POLICY "Managers can insert journal entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = journal_entries.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update journal entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = journal_entries.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = journal_entries.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- Journal Entry Lines
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
  description text NOT NULL DEFAULT '',
  debit numeric NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit numeric NOT NULL DEFAULT 0 CHECK (credit >= 0)
);

ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read journal entry lines in own tenant"
  ON journal_entry_lines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      JOIN profiles p ON p.tenant_id = je.tenant_id
      WHERE je.id = journal_entry_lines.journal_entry_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "Managers can insert journal entry lines"
  ON journal_entry_lines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_entries je
      JOIN profiles p ON p.tenant_id = je.tenant_id
      WHERE je.id = journal_entry_lines.journal_entry_id AND p.id = auth.uid() AND p.role IN ('superadmin', 'tenantadmin', 'manager')
    )
  );

-- AP Invoices
CREATE TABLE IF NOT EXISTS ap_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  vendor_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0 CHECK (amount >= 0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending', 'Approved', 'Paid')),
  description text NOT NULL DEFAULT '',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  UNIQUE(tenant_id, invoice_number)
);

ALTER TABLE ap_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read AP invoices in own tenant"
  ON ap_invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ap_invoices.tenant_id)
  );

CREATE POLICY "Managers can insert AP invoices"
  ON ap_invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ap_invoices.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update AP invoices"
  ON ap_invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ap_invoices.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ap_invoices.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- AR Invoices
CREATE TABLE IF NOT EXISTS ar_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  customer_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0 CHECK (amount >= 0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Sent', 'Paid', 'Overdue')),
  description text NOT NULL DEFAULT '',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  UNIQUE(tenant_id, invoice_number)
);

ALTER TABLE ar_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read AR invoices in own tenant"
  ON ar_invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ar_invoices.tenant_id)
  );

CREATE POLICY "Managers can insert AR invoices"
  ON ar_invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ar_invoices.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update AR invoices"
  ON ar_invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ar_invoices.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ar_invoices.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- AR Payments
CREATE TABLE IF NOT EXISTS ar_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES ar_invoices(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0 CHECK (amount > 0),
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL DEFAULT 'Bank Transfer',
  reference text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ar_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read AR payments in own tenant"
  ON ar_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ar_payments.tenant_id)
  );

CREATE POLICY "Managers can insert AR payments"
  ON ar_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = ar_payments.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- Fiscal Periods
CREATE TABLE IF NOT EXISTS fiscal_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period text NOT NULL,
  is_closed boolean NOT NULL DEFAULT false,
  closed_by uuid REFERENCES profiles(id),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, period)
);

ALTER TABLE fiscal_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read fiscal periods in own tenant"
  ON fiscal_periods FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = fiscal_periods.tenant_id)
  );

CREATE POLICY "Managers can insert fiscal periods"
  ON fiscal_periods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = fiscal_periods.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

CREATE POLICY "Managers can update fiscal periods"
  ON fiscal_periods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = fiscal_periods.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = fiscal_periods.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager'))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coa_tenant ON chart_of_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_je_tenant ON journal_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jel_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_ap_tenant ON ap_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ar_tenant ON ar_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_arp_tenant ON ar_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fp_tenant ON fiscal_periods(tenant_id);

-- Seed: Chart of Accounts
INSERT INTO chart_of_accounts (tenant_id, account_code, account_name, account_type, balance) VALUES
  ('a0000000-0000-0000-0000-000000000001', '1000', 'Cash', 'Asset', 524300.00),
  ('a0000000-0000-0000-0000-000000000001', '1100', 'Accounts Receivable', 'Asset', 187600.00),
  ('a0000000-0000-0000-0000-000000000001', '1200', 'Inventory', 'Asset', 342800.00),
  ('a0000000-0000-0000-0000-000000000001', '1500', 'Fixed Assets', 'Asset', 1250000.00),
  ('a0000000-0000-0000-0000-000000000001', '2000', 'Accounts Payable', 'Liability', 95400.00),
  ('a0000000-0000-0000-0000-000000000001', '2100', 'Accrued Liabilities', 'Liability', 43200.00),
  ('a0000000-0000-0000-0000-000000000001', '2200', 'Long-term Debt', 'Liability', 450000.00),
  ('a0000000-0000-0000-0000-000000000001', '3000', 'Retained Earnings', 'Equity', 892000.00),
  ('a0000000-0000-0000-0000-000000000001', '3100', 'Common Stock', 'Equity', 500000.00),
  ('a0000000-0000-0000-0000-000000000001', '4000', 'Sales Revenue', 'Revenue', 2847500.00),
  ('a0000000-0000-0000-0000-000000000001', '4100', 'Service Revenue', 'Revenue', 425000.00),
  ('a0000000-0000-0000-0000-000000000001', '5000', 'Cost of Goods Sold', 'Expense', 1120000.00),
  ('a0000000-0000-0000-0000-000000000001', '5100', 'Salaries Expense', 'Expense', 680000.00),
  ('a0000000-0000-0000-0000-000000000001', '5200', 'Rent Expense', 'Expense', 144000.00),
  ('a0000000-0000-0000-0000-000000000001', '5300', 'Utilities Expense', 'Expense', 36000.00)
ON CONFLICT (tenant_id, account_code) DO NOTHING;

-- Seed: Fiscal periods
INSERT INTO fiscal_periods (tenant_id, period, is_closed) VALUES
  ('a0000000-0000-0000-0000-000000000001', '2026-01', true),
  ('a0000000-0000-0000-0000-000000000001', '2026-02', true),
  ('a0000000-0000-0000-0000-000000000001', '2026-03', true),
  ('a0000000-0000-0000-0000-000000000001', '2026-04', false)
ON CONFLICT (tenant_id, period) DO NOTHING;

-- Seed: AP Invoices
INSERT INTO ap_invoices (tenant_id, invoice_number, vendor_name, amount, due_date, status, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'AP-1001', 'TechSupply Inc.', 45200.00, '2026-04-15', 'Approved', 'Server hardware Q2'),
  ('a0000000-0000-0000-0000-000000000001', 'AP-1002', 'CloudHost Services', 12800.00, '2026-04-20', 'Paid', 'Monthly cloud hosting'),
  ('a0000000-0000-0000-0000-000000000001', 'AP-1003', 'OfficeMax Pro', 3400.00, '2026-04-10', 'Pending', 'Office supplies reorder'),
  ('a0000000-0000-0000-0000-000000000001', 'AP-1004', 'SecureNet LLC', 8900.00, '2026-05-01', 'Draft', 'Annual security audit'),
  ('a0000000-0000-0000-0000-000000000001', 'AP-1005', 'DataWorks Corp', 22100.00, '2026-03-25', 'Approved', 'Data analytics platform'),
  ('a0000000-0000-0000-0000-000000000001', 'AP-1006', 'PrintMaster Co.', 1500.00, '2026-03-15', 'Paid', 'Marketing collateral print'),
  ('a0000000-0000-0000-0000-000000000001', 'AP-1007', 'FastFreight Ltd.', 6700.00, '2026-04-05', 'Pending', 'Warehouse shipping Q1'),
  ('a0000000-0000-0000-0000-000000000001', 'AP-1008', 'GreenClean Services', 2200.00, '2026-04-28', 'Draft', 'Facility cleaning contract')
ON CONFLICT (tenant_id, invoice_number) DO NOTHING;

-- Seed: AR Invoices
INSERT INTO ar_invoices (tenant_id, invoice_number, customer_name, amount, due_date, status, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'AR-2001', 'GlobalTech Industries', 87500.00, '2026-04-30', 'Sent', 'Enterprise license Q2'),
  ('a0000000-0000-0000-0000-000000000001', 'AR-2002', 'Metro Health Systems', 34200.00, '2026-04-15', 'Paid', 'Implementation services'),
  ('a0000000-0000-0000-0000-000000000001', 'AR-2003', 'Summit Financial Group', 56800.00, '2026-05-15', 'Sent', 'Consulting engagement'),
  ('a0000000-0000-0000-0000-000000000001', 'AR-2004', 'Pacific Retail Corp', 12400.00, '2026-03-20', 'Overdue', 'Support renewal annual'),
  ('a0000000-0000-0000-0000-000000000001', 'AR-2005', 'NovaTech Solutions', 29100.00, '2026-04-10', 'Paid', 'Custom module dev'),
  ('a0000000-0000-0000-0000-000000000001', 'AR-2006', 'Atlas Manufacturing', 41300.00, '2026-05-01', 'Draft', 'Training package Q2')
ON CONFLICT (tenant_id, invoice_number) DO NOTHING;

-- Seed: Journal Entries
INSERT INTO journal_entries (tenant_id, entry_number, description, entry_date, period, is_posted) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'JE-0001', 'Record monthly payroll', '2026-04-01', '2026-04', true),
  ('a0000000-0000-0000-0000-000000000001', 'JE-0002', 'Record rent expense', '2026-04-01', '2026-04', true),
  ('a0000000-0000-0000-0000-000000000001', 'JE-0003', 'Customer payment received', '2026-04-10', '2026-04', true),
  ('a0000000-0000-0000-0000-000000000001', 'JE-0004', 'Vendor invoice approval', '2026-04-12', '2026-04', false)
ON CONFLICT (tenant_id, entry_number) DO NOTHING;

-- Seed: Journal Entry Lines
INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
SELECT je.id, coa.id, 'Payroll expense', 68000.00, 0
FROM journal_entries je, chart_of_accounts coa
WHERE je.entry_number = 'JE-0001' AND coa.account_code = '5100' AND coa.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
SELECT je.id, coa.id, 'Cash disbursement', 0, 68000.00
FROM journal_entries je, chart_of_accounts coa
WHERE je.entry_number = 'JE-0001' AND coa.account_code = '1000' AND coa.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
SELECT je.id, coa.id, 'Rent expense', 12000.00, 0
FROM journal_entries je, chart_of_accounts coa
WHERE je.entry_number = 'JE-0002' AND coa.account_code = '5200' AND coa.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
SELECT je.id, coa.id, 'Cash disbursement', 0, 12000.00
FROM journal_entries je, chart_of_accounts coa
WHERE je.entry_number = 'JE-0002' AND coa.account_code = '1000' AND coa.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
SELECT je.id, coa.id, 'Cash received', 34200.00, 0
FROM journal_entries je, chart_of_accounts coa
WHERE je.entry_number = 'JE-0003' AND coa.account_code = '1000' AND coa.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
SELECT je.id, coa.id, 'AR reduction', 0, 34200.00
FROM journal_entries je, chart_of_accounts coa
WHERE je.entry_number = 'JE-0003' AND coa.account_code = '1100' AND coa.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
SELECT je.id, coa.id, 'COGS increase', 45200.00, 0
FROM journal_entries je, chart_of_accounts coa
WHERE je.entry_number = 'JE-0004' AND coa.account_code = '5000' AND coa.tenant_id = 'a0000000-0000-0000-0000-000000000001';

INSERT INTO journal_entry_lines (journal_entry_id, account_id, description, debit, credit)
SELECT je.id, coa.id, 'Vendor liability', 0, 45200.00
FROM journal_entries je, chart_of_accounts coa
WHERE je.entry_number = 'JE-0004' AND coa.account_code = '2000' AND coa.tenant_id = 'a0000000-0000-0000-0000-000000000001';
