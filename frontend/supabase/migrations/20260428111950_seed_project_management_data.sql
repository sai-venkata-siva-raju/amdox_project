/*
  # Seed Project Management Data

  Add additional projects, milestones, tasks, and project members
  with overallocation scenarios for resource utilization view.
*/

DO $$
DECLARE
  t_id uuid;
  e_ids uuid[];
  p_erp uuid;
  p_wh uuid;
  p_portal uuid;
  p_mobile uuid;
  p_security uuid;
  p_data uuid;
BEGIN
  SELECT id INTO t_id FROM tenants LIMIT 1;
  IF t_id IS NULL THEN RETURN; END IF;

  SELECT ARRAY_AGG(id ORDER BY created_at) INTO e_ids FROM employees WHERE tenant_id = t_id LIMIT 8;

  SELECT id INTO p_erp FROM projects WHERE tenant_id = t_id AND name = 'ERP Platform Migration' LIMIT 1;
  SELECT id INTO p_wh FROM projects WHERE tenant_id = t_id AND name = 'Warehouse Automation' LIMIT 1;
  SELECT id INTO p_portal FROM projects WHERE tenant_id = t_id AND name = 'Customer Portal v2' LIMIT 1;

  -- Add more projects
  INSERT INTO projects (id, tenant_id, name, description, status, start_date, deadline, budget_planned, budget_actual, progress)
  VALUES
    (gen_random_uuid(), t_id, 'Mobile App Development', 'Native mobile app for field operations and manager approvals', 'Active', '2026-02-01', '2026-07-15', 120000, 42000, 40),
    (gen_random_uuid(), t_id, 'Security Compliance Audit', 'Annual SOC 2 Type II compliance audit and remediation', 'Planning', '2026-05-01', '2026-09-30', 65000, 0, 5),
    (gen_random_uuid(), t_id, 'Data Migration - Legacy Systems', 'Migrate data from legacy on-prem systems to cloud', 'On Hold', '2026-03-01', '2026-06-30', 80000, 15000, 18)
  ON CONFLICT DO NOTHING;

  SELECT id INTO p_mobile FROM projects WHERE tenant_id = t_id AND name = 'Mobile App Development' LIMIT 1;
  SELECT id INTO p_security FROM projects WHERE tenant_id = t_id AND name = 'Security Compliance Audit' LIMIT 1;
  SELECT id INTO p_data FROM projects WHERE tenant_id = t_id AND name = 'Data Migration - Legacy Systems' LIMIT 1;

  -- Milestones for Warehouse Automation
  IF p_wh IS NOT NULL THEN
    INSERT INTO milestones (id, tenant_id, project_id, name, due_date, status, sort_order) VALUES
      (gen_random_uuid(), t_id, p_wh, 'IoT Sensor Installation', '2026-04-30', 'Completed', 1),
      (gen_random_uuid(), t_id, p_wh, 'Picking System Config', '2026-06-30', 'Pending', 2),
      (gen_random_uuid(), t_id, p_wh, 'Full Integration Test', '2026-08-31', 'Pending', 3),
      (gen_random_uuid(), t_id, p_wh, 'Go-Live', '2026-09-15', 'Pending', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Milestones for Mobile App
  IF p_mobile IS NOT NULL THEN
    INSERT INTO milestones (id, tenant_id, project_id, name, due_date, status, sort_order) VALUES
      (gen_random_uuid(), t_id, p_mobile, 'UI/UX Prototyping', '2026-02-28', 'Completed', 1),
      (gen_random_uuid(), t_id, p_mobile, 'Core Features Build', '2026-04-30', 'Completed', 2),
      (gen_random_uuid(), t_id, p_mobile, 'Beta Testing', '2026-06-15', 'Pending', 3),
      (gen_random_uuid(), t_id, p_mobile, 'App Store Launch', '2026-07-15', 'Pending', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Milestones for Customer Portal
  IF p_portal IS NOT NULL THEN
    INSERT INTO milestones (id, tenant_id, project_id, name, due_date, status, sort_order) VALUES
      (gen_random_uuid(), t_id, p_portal, 'Design System Setup', '2026-06-15', 'Pending', 1),
      (gen_random_uuid(), t_id, p_portal, 'Portal Pages Build', '2026-09-30', 'Pending', 2),
      (gen_random_uuid(), t_id, p_portal, 'API Integration', '2026-11-15', 'Pending', 3),
      (gen_random_uuid(), t_id, p_portal, 'Launch and Monitoring', '2026-12-31', 'Pending', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Milestones for Security Compliance
  IF p_security IS NOT NULL THEN
    INSERT INTO milestones (id, tenant_id, project_id, name, due_date, status, sort_order) VALUES
      (gen_random_uuid(), t_id, p_security, 'Access Control Review', '2026-06-30', 'Pending', 1),
      (gen_random_uuid(), t_id, p_security, 'Penetration Testing', '2026-08-15', 'Pending', 2),
      (gen_random_uuid(), t_id, p_security, 'Remediation Complete', '2026-09-30', 'Pending', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Milestones for Data Migration
  IF p_data IS NOT NULL THEN
    INSERT INTO milestones (id, tenant_id, project_id, name, due_date, status, sort_order) VALUES
      (gen_random_uuid(), t_id, p_data, 'Source System Analysis', '2026-03-31', 'Completed', 1),
      (gen_random_uuid(), t_id, p_data, 'ETL Pipeline Setup', '2026-05-15', 'Pending', 2),
      (gen_random_uuid(), t_id, p_data, 'Data Validation', '2026-06-30', 'Pending', 3)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Additional tasks
  IF p_erp IS NOT NULL THEN
    UPDATE tasks SET estimated_hours = 40, tenant_id = t_id WHERE project_id = p_erp AND title = 'Map legacy data schemas';
    UPDATE tasks SET estimated_hours = 80, tenant_id = t_id WHERE project_id = p_erp AND title = 'Configure cloud environment';
    UPDATE tasks SET estimated_hours = 60, tenant_id = t_id WHERE project_id = p_erp AND title = 'Build API integration layer';

    INSERT INTO tasks (id, tenant_id, project_id, title, description, priority, status, due_date, estimated_hours) VALUES
      (gen_random_uuid(), t_id, p_erp, 'Build auth module', 'Implement SSO and MFA', 'Critical', 'Done', '2026-05-01', 80),
      (gen_random_uuid(), t_id, p_erp, 'Finance module UI', 'Chart of accounts and journal entries', 'High', 'In Progress', '2026-06-15', 120),
      (gen_random_uuid(), t_id, p_erp, 'End-to-end testing', 'Full regression test suite', 'Medium', 'To Do', '2026-08-15', 80)
    ON CONFLICT DO NOTHING;
  END IF;

  IF p_wh IS NOT NULL THEN
    INSERT INTO tasks (id, tenant_id, project_id, title, description, priority, status, due_date, estimated_hours) VALUES
      (gen_random_uuid(), t_id, p_wh, 'Install conveyor sensors', 'Deploy IoT sensors on conveyor lines', 'High', 'In Progress', '2026-05-15', 40),
      (gen_random_uuid(), t_id, p_wh, 'Configure picking algorithms', 'Set up automated picking logic', 'Critical', 'To Do', '2026-07-30', 60),
      (gen_random_uuid(), t_id, p_wh, 'Safety compliance check', 'Verify all safety interlocks', 'High', 'To Do', '2026-08-30', 24)
    ON CONFLICT DO NOTHING;
  END IF;

  IF p_mobile IS NOT NULL THEN
    INSERT INTO tasks (id, tenant_id, project_id, title, description, priority, status, due_date, estimated_hours) VALUES
      (gen_random_uuid(), t_id, p_mobile, 'Push notification service', 'FCM integration for real-time alerts', 'High', 'In Progress', '2026-04-20', 40),
      (gen_random_uuid(), t_id, p_mobile, 'Offline mode sync', 'Local storage with conflict resolution', 'Critical', 'In Review', '2026-05-01', 60),
      (gen_random_uuid(), t_id, p_mobile, 'Approval workflow UI', 'Swipe-to-approve for managers', 'Medium', 'In Progress', '2026-05-15', 32),
      (gen_random_uuid(), t_id, p_mobile, 'Biometric auth', 'Face ID and fingerprint login', 'Low', 'To Do', '2026-06-01', 24)
    ON CONFLICT DO NOTHING;
  END IF;

  IF p_portal IS NOT NULL THEN
    INSERT INTO tasks (id, tenant_id, project_id, title, description, priority, status, due_date, estimated_hours) VALUES
      (gen_random_uuid(), t_id, p_portal, 'Design system components', 'Build reusable UI component library', 'High', 'To Do', '2026-06-30', 48),
      (gen_random_uuid(), t_id, p_portal, 'Order tracking page', 'Real-time shipment tracking', 'High', 'To Do', '2026-09-15', 56),
      (gen_random_uuid(), t_id, p_portal, 'Invoice download center', 'PDF generation and download', 'Medium', 'To Do', '2026-10-30', 32)
    ON CONFLICT DO NOTHING;
  END IF;

  IF p_security IS NOT NULL THEN
    INSERT INTO tasks (id, tenant_id, project_id, title, description, priority, status, due_date, estimated_hours) VALUES
      (gen_random_uuid(), t_id, p_security, 'Access control review', 'Audit all role-based permissions', 'Critical', 'To Do', '2026-06-15', 40),
      (gen_random_uuid(), t_id, p_security, 'Penetration testing', 'External security assessment', 'High', 'To Do', '2026-08-01', 60),
      (gen_random_uuid(), t_id, p_security, 'Remediation plan', 'Address findings from audit', 'Medium', 'To Do', '2026-09-15', 80)
    ON CONFLICT DO NOTHING;
  END IF;

  IF p_data IS NOT NULL THEN
    INSERT INTO tasks (id, tenant_id, project_id, title, description, priority, status, due_date, estimated_hours) VALUES
      (gen_random_uuid(), t_id, p_data, 'Source system analysis', 'Map data from legacy schemas', 'High', 'Done', '2026-03-15', 30),
      (gen_random_uuid(), t_id, p_data, 'ETL pipeline setup', 'Build extraction and transform jobs', 'Critical', 'In Progress', '2026-05-01', 80),
      (gen_random_uuid(), t_id, p_data, 'Data validation scripts', 'Automated reconciliation checks', 'Medium', 'To Do', '2026-05-30', 40)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Project members with overallocation scenarios
  IF array_length(e_ids, 1) >= 5 THEN
    -- Employee 1: 80% ERP + 40% Mobile = 120% (overallocated)
    INSERT INTO project_members (tenant_id, project_id, employee_id, allocation_pct, role) VALUES
      (t_id, p_erp, e_ids[1], 80, 'Lead'),
      (t_id, p_erp, e_ids[2], 60, 'Member'),
      (t_id, p_mobile, e_ids[1], 40, 'Member'),
      (t_id, p_mobile, e_ids[3], 50, 'Lead'),
      (t_id, p_wh, e_ids[2], 50, 'Member'),
      (t_id, p_wh, e_ids[4], 70, 'Lead'),
      (t_id, p_portal, e_ids[5], 100, 'Lead'),
      (t_id, p_security, e_ids[5], 30, 'Reviewer'),
      (t_id, p_data, e_ids[4], 40, 'Member')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
