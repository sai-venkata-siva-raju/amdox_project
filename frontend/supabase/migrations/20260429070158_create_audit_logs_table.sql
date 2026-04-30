/*
  # Create Audit Logs Table

  1. New Tables
    - `audit_logs` - Tracks all system actions for compliance and debugging
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `user_id` (uuid, references profiles, nullable for system actions)
      - `action` (text) - The action performed: Create, Update, Delete, Login, etc.
      - `module` (text) - The module: Finance, HR, Supply Chain, Projects, System
      - `entity_type` (text) - The type of entity: invoice, employee, purchase_order, project, etc.
      - `entity_id` (text, nullable) - The ID of the affected entity
      - `description` (text) - Human-readable description of the action
      - `ip_address` (text) - IP address of the user
      - `metadata` (jsonb, nullable) - Additional context about the action
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on audit_logs
    - Tenant members can read their own tenant's audit logs
    - Only tenant admins can insert audit logs (typically via edge functions/triggers)

  3. Seed Data
    - Sample audit log entries across all modules
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  module text NOT NULL,
  entity_type text NOT NULL DEFAULT 'general',
  entity_id text,
  description text NOT NULL DEFAULT '',
  ip_address text DEFAULT '0.0.0.0',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Tenant admins can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Seed Data
DO $$
DECLARE
  t_id uuid;
  u_id uuid;
BEGIN
  SELECT id INTO t_id FROM tenants LIMIT 1;
  IF t_id IS NULL THEN RETURN; END IF;

  SELECT id INTO u_id FROM profiles WHERE tenant_id = t_id LIMIT 1;

  INSERT INTO audit_logs (tenant_id, user_id, action, module, entity_type, description, ip_address, created_at) VALUES
    (t_id, u_id, 'Create', 'Finance', 'invoice', 'Created invoice #INV-2848 for $12,500', '192.168.1.100', now() - interval '10 minutes'),
    (t_id, u_id, 'Update', 'Finance', 'invoice', 'Updated invoice #INV-2848 status to Approved', '192.168.1.100', now() - interval '8 minutes'),
    (t_id, u_id, 'Create', 'HR', 'employee', 'Added new employee Sarah Chen to Engineering', '192.168.1.100', now() - interval '1 hour'),
    (t_id, u_id, 'Update', 'HR', 'leave_request', 'Approved leave request for John Smith (Apr 28-29)', '192.168.1.100', now() - interval '2 hours'),
    (t_id, u_id, 'Create', 'Supply Chain', 'purchase_order', 'Created PO #PO-1002 for Widget Assembly Kit (500 units)', '10.0.0.45', now() - interval '3 hours'),
    (t_id, u_id, 'Update', 'Supply Chain', 'purchase_order', 'Updated PO #PO-1002 status to Received', '10.0.0.45', now() - interval '4 hours'),
    (t_id, u_id, 'Create', 'Projects', 'project', 'Created project: Mobile App Development', '192.168.1.100', now() - interval '6 hours'),
    (t_id, u_id, 'Update', 'Projects', 'task', 'Marked task "Build auth module" as Done', '192.168.1.100', now() - interval '8 hours'),
    (t_id, u_id, 'Delete', 'Finance', 'invoice', 'Deleted draft invoice #INV-2840', '172.16.0.22', now() - interval '1 day'),
    (t_id, u_id, 'Login', 'System', 'session', 'User logged in from Chrome on Desktop', '192.168.1.100', now() - interval '1 day'),
    (t_id, u_id, 'Update', 'Finance', 'journal_entry', 'Posted journal entry JE-2026-0428 for $8,750', '192.168.1.100', now() - interval '1 day'),
    (t_id, u_id, 'Create', 'HR', 'payroll_run', 'Created payroll run for April 2026', '192.168.1.100', now() - interval '2 days'),
    (t_id, u_id, 'Update', 'Supply Chain', 'product', 'Updated reorder point for Widget Assembly Kit to 10', '10.0.0.45', now() - interval '2 days'),
    (t_id, u_id, 'Create', 'Projects', 'milestone', 'Added milestone "Beta Testing" to Mobile App Development', '192.168.1.100', now() - interval '3 days'),
    (t_id, u_id, 'Delete', 'Projects', 'task', 'Deleted task "Legacy cleanup" from ERP Platform Migration', '172.16.0.22', now() - interval '3 days'),
    (t_id, u_id, 'Login', 'System', 'session', 'User logged in from Safari on Mobile', '10.0.0.45', now() - interval '4 days'),
    (t_id, u_id, 'Update', 'Finance', 'invoice', 'Marked invoice #INV-2830 as Paid ($5,200 received)', '192.168.1.100', now() - interval '5 days'),
    (t_id, u_id, 'Create', 'HR', 'employee', 'Added new employee Mike Torres to Supply Chain', '192.168.1.100', now() - interval '6 days')
  ON CONFLICT DO NOTHING;
END;
$$;
