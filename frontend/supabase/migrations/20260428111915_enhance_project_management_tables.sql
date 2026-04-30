/*
  # Enhance Project Management Tables

  1. Changes
    - Add `tenant_id` column to `milestones`, `tasks`, `project_members` tables
    - Add `milestone_id` column to `tasks`
    - Add `estimated_hours` column to `tasks`
    - Add `updated_at` column to `projects` and `tasks`
    - Populate `tenant_id` from parent `projects` table
    - Add indexes for new columns
    - Add more seed data: milestones, tasks, project members with overallocation

  2. Security
    - RLS policies already exist on all tables (no changes needed)

  3. Important Notes
    - tenant_id populated from projects table via UPDATE
    - Foreign key from tasks.milestone_id to milestones.id
*/

-- Add tenant_id to milestones
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Add tenant_id to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Add tenant_id to project_members
ALTER TABLE project_members ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE;

-- Populate tenant_id from projects
UPDATE milestones SET tenant_id = (SELECT tenant_id FROM projects WHERE projects.id = milestones.project_id) WHERE tenant_id IS NULL;
UPDATE tasks SET tenant_id = (SELECT tenant_id FROM projects WHERE projects.id = tasks.project_id) WHERE tenant_id IS NULL;
UPDATE project_members SET tenant_id = (SELECT tenant_id FROM projects WHERE projects.id = project_members.project_id) WHERE tenant_id IS NULL;

-- Make tenant_id NOT NULL after population
ALTER TABLE milestones ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE project_members ALTER COLUMN tenant_id SET NOT NULL;

-- Add milestone_id to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id uuid REFERENCES milestones(id) ON DELETE SET NULL;

-- Add estimated_hours to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours numeric(8,2) DEFAULT 0;

-- Add updated_at to projects and tasks
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_milestones_tenant ON milestones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_project_members_tenant ON project_members(tenant_id);
