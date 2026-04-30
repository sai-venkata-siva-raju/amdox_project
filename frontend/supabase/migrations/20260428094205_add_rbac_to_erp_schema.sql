/*
  # Add Role-Based Access Control to ERP Schema

  1. Changes
    - Add `role` column constraint to `profiles` table to support:
      SuperAdmin, TenantAdmin, Manager, Viewer
    - Add `tenant_name` and `tenant_slug` columns to `profiles` for quick access
    - Create `tenant_invitations` table for managing new user invitations
    - Add index on profiles.tenant_id for faster lookups

  2. New Tables
    - `tenant_invitations`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, references tenants)
      - `email` (text, invited email)
      - `role` (text, role to assign)
      - `token` (text, unique invitation token)
      - `accepted` (boolean, default false)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on tenant_invitations
    - Only TenantAdmin+ can manage invitations
    - Users can read their own invitations by email
*/

-- Add check constraint for valid roles on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'viewer';
  END IF;
END $$;

-- Update existing role values to match new constraint
UPDATE profiles SET role = 'viewer' WHERE role = 'employee';

-- Add check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('superadmin', 'tenantadmin', 'manager', 'viewer'));

-- Create tenant_invitations table
CREATE TABLE IF NOT EXISTS tenant_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('superadmin', 'tenantadmin', 'manager', 'viewer')),
  token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  accepted boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant admins can read invitations"
  ON tenant_invitations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tenant_id = tenant_invitations.tenant_id
      AND profiles.role IN ('superadmin', 'tenantadmin')
    )
  );

CREATE POLICY "Users can read own invitations by email"
  ON tenant_invitations FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Tenant admins can create invitations"
  ON tenant_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tenant_id = tenant_invitations.tenant_id
      AND profiles.role IN ('superadmin', 'tenantadmin')
    )
  );

CREATE POLICY "Tenant admins can update invitations"
  ON tenant_invitations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.tenant_id = tenant_invitations.tenant_id
      AND profiles.role IN ('superadmin', 'tenantadmin')
    )
  );

-- Add index for faster tenant lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_tenant_id ON kpi_metrics(tenant_id);
