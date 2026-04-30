/*
  # Create BI & Analytics Tables

  1. New Tables
    - `monthly_revenue` - Revenue data for charts
      - tenant_id, month (text), revenue (numeric), target (numeric)
    - `department_expenses` - Department expense tracking
      - tenant_id, department (text), month (text), amount (numeric), budget (numeric)
    - `demand_forecasts` - AI demand forecasting results
      - tenant_id, product_id, forecast_date (date), predicted_demand (numeric), lower_bound (numeric), upper_bound (numeric), mape_score (numeric)
    - `kpi_targets` - KPI target tracking
      - tenant_id, kpi_name (text), actual (numeric), target (numeric), period (text)

  2. Seed Data
    - 12 months of revenue data
    - 6 departments x 3 months of expenses
    - Demand forecasts for 10 SKUs
    - KPI targets
*/

CREATE TABLE IF NOT EXISTS monthly_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month text NOT NULL,
  revenue numeric NOT NULL DEFAULT 0,
  target numeric NOT NULL DEFAULT 0,
  UNIQUE(tenant_id, month)
);

ALTER TABLE monthly_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read revenue in own tenant"
  ON monthly_revenue FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = monthly_revenue.tenant_id));

CREATE POLICY "Managers can insert revenue"
  ON monthly_revenue FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = monthly_revenue.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

CREATE TABLE IF NOT EXISTS department_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  department text NOT NULL,
  month text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  budget numeric NOT NULL DEFAULT 0
);

ALTER TABLE department_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read dept expenses in own tenant"
  ON department_expenses FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = department_expenses.tenant_id));

CREATE POLICY "Managers can insert dept expenses"
  ON department_expenses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = department_expenses.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

CREATE TABLE IF NOT EXISTS demand_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  forecast_date date NOT NULL,
  predicted_demand numeric NOT NULL DEFAULT 0,
  lower_bound numeric NOT NULL DEFAULT 0,
  upper_bound numeric NOT NULL DEFAULT 0,
  mape_score numeric NOT NULL DEFAULT 0
);

ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read forecasts in own tenant"
  ON demand_forecasts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = demand_forecasts.tenant_id));

CREATE POLICY "Managers can insert forecasts"
  ON demand_forecasts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = demand_forecasts.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

CREATE TABLE IF NOT EXISTS kpi_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kpi_name text NOT NULL,
  actual numeric NOT NULL DEFAULT 0,
  target numeric NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT '2026-04',
  UNIQUE(tenant_id, kpi_name, period)
);

ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read KPIs in own tenant"
  ON kpi_targets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = kpi_targets.tenant_id));

CREATE POLICY "Managers can insert KPIs"
  ON kpi_targets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.tenant_id = kpi_targets.tenant_id AND profiles.role IN ('superadmin', 'tenantadmin', 'manager')));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monthly_rev_tenant ON monthly_revenue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dept_exp_tenant ON department_expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_demand_fc_tenant ON demand_forecasts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kpi_tenant ON kpi_targets(tenant_id);

-- Seed: Monthly Revenue (last 12 months)
INSERT INTO monthly_revenue (tenant_id, month, revenue, target) VALUES
  ('a0000000-0000-0000-0000-000000000001', '2025-05', 285000, 300000),
  ('a0000000-0000-0000-0000-000000000001', '2025-06', 310000, 300000),
  ('a0000000-0000-0000-0000-000000000001', '2025-07', 295000, 310000),
  ('a0000000-0000-0000-0000-000000000001', '2025-08', 325000, 310000),
  ('a0000000-0000-0000-0000-000000000001', '2025-09', 340000, 320000),
  ('a0000000-0000-0000-0000-000000000001', '2025-10', 318000, 330000),
  ('a0000000-0000-0000-0000-000000000001', '2025-11', 355000, 340000),
  ('a0000000-0000-0000-0000-000000000001', '2025-12', 410000, 360000),
  ('a0000000-0000-0000-0000-000000000001', '2026-01', 345000, 350000),
  ('a0000000-0000-0000-0000-000000000001', '2026-02', 362000, 355000),
  ('a0000000-0000-0000-0000-000000000001', '2026-03', 378000, 360000),
  ('a0000000-0000-0000-0000-000000000001', '2026-04', 392000, 370000)
ON CONFLICT (tenant_id, month) DO NOTHING;

-- Seed: Department Expenses
INSERT INTO department_expenses (tenant_id, department, month, amount, budget) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Engineering', '2026-04', 142000, 135000),
  ('a0000000-0000-0000-0000-000000000001', 'Finance', '2026-04', 48000, 50000),
  ('a0000000-0000-0000-0000-000000000001', 'Sales', '2026-04', 62000, 60000),
  ('a0000000-0000-0000-0000-000000000001', 'HR', '2026-04', 35000, 38000),
  ('a0000000-0000-0000-0000-000000000001', 'Operations', '2026-04', 55000, 52000),
  ('a0000000-0000-0000-0000-000000000001', 'Marketing', '2026-04', 41000, 45000),
  ('a0000000-0000-0000-0000-000000000001', 'Engineering', '2026-03', 138000, 135000),
  ('a0000000-0000-0000-0000-000000000001', 'Finance', '2026-03', 46000, 50000),
  ('a0000000-0000-0000-0000-000000000001', 'Sales', '2026-03', 58000, 60000),
  ('a0000000-0000-0000-0000-000000000001', 'HR', '2026-03', 34000, 38000),
  ('a0000000-0000-0000-0000-000000000001', 'Operations', '2026-03', 51000, 52000),
  ('a0000000-0000-0000-0000-000000000001', 'Marketing', '2026-03', 39000, 45000);

-- Seed: Demand Forecasts (90 days for first 3 products)
-- Generate forecasts using a loop approach
INSERT INTO demand_forecasts (tenant_id, product_id, forecast_date, predicted_demand, lower_bound, upper_bound, mape_score)
SELECT
  p.tenant_id,
  p.id,
  d.dt::date AS forecast_date,
  (15 + 5 * sin((EXTRACT(DOY FROM d.dt::date))::numeric / 7.0) + (random() * 4)::numeric)::numeric AS predicted_demand,
  (10 + 3 * sin((EXTRACT(DOY FROM d.dt::date))::numeric / 7.0))::numeric AS lower_bound,
  (20 + 7 * sin((EXTRACT(DOY FROM d.dt::date))::numeric / 7.0) + (random() * 3)::numeric)::numeric AS upper_bound,
  8.5 AS mape_score
FROM products p
CROSS JOIN (
  SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '89 days', INTERVAL '1 day') AS dt
) d
WHERE p.tenant_id = 'a0000000-0000-0000-0000-000000000001'
  AND p.sku IN ('SKU-001', 'SKU-002', 'SKU-003');

-- Seed: KPI Targets
INSERT INTO kpi_targets (tenant_id, kpi_name, actual, target, period) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Monthly Revenue', 392000, 370000, '2026-04'),
  ('a0000000-0000-0000-0000-000000000001', 'Gross Margin', 42.5, 45.0, '2026-04'),
  ('a0000000-0000-0000-0000-000000000001', 'Customer Acquisition', 28, 35, '2026-04'),
  ('a0000000-0000-0000-0000-000000000001', 'Employee Retention', 94.2, 95.0, '2026-04'),
  ('a0000000-0000-0000-0000-000000000001', 'Inventory Turnover', 6.8, 8.0, '2026-04')
ON CONFLICT (tenant_id, kpi_name, period) DO NOTHING;
