// Mock data for the ERP system after removing backend connectivity

export const mockPurchaseOrders = [
  {
    id: '1',
    order_number: 'PO-001',
    vendor_name: 'Acme Supplies',
    status: 'pending',
    total_amount: 15000,
    order_date: '2024-01-15',
    expected_delivery: '2024-01-25'
  },
  {
    id: '2',
    order_number: 'PO-002',
    vendor_name: 'Global Materials',
    status: 'approved',
    total_amount: 28000,
    order_date: '2024-01-10',
    expected_delivery: '2024-01-20'
  },
  {
    id: '3',
    order_number: 'PO-003',
    vendor_name: 'Tech Components Inc',
    status: 'delivered',
    total_amount: 8500,
    order_date: '2024-01-05',
    expected_delivery: '2024-01-15'
  }
];

export const mockInventory = [
  {
    id: '1',
    sku: 'RM-001',
    name: 'Raw Material A',
    description: 'Primary raw material for production',
    category: 'Raw Materials',
    unit_price: 25.50,
    quantity_on_hand: 500,
    reorder_point: 100,
    warehouse_location: 'Warehouse A'
  },
  {
    id: '2',
    sku: 'CP-002',
    name: 'Component B',
    description: 'Electronic component for assembly',
    category: 'Components',
    unit_price: 45.00,
    quantity_on_hand: 250,
    reorder_point: 50,
    warehouse_location: 'Warehouse B'
  },
  {
    id: '3',
    sku: 'FP-003',
    name: 'Finished Product C',
    description: 'Final assembled product',
    category: 'Finished Goods',
    unit_price: 125.00,
    quantity_on_hand: 75,
    reorder_point: 25,
    warehouse_location: 'Warehouse A'
  }
];

export const mockEmployees = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    role: 'Senior Developer',
    salary: 85000,
    joining_date: '2022-01-15',
    status: 'Active',
    manager_id: null,
    phone: '555-0101'
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@company.com',
    department: 'Finance',
    role: 'Accountant',
    salary: 65000,
    joining_date: '2021-03-20',
    status: 'Active',
    manager_id: null,
    phone: '555-0102'
  },
  {
    id: '3',
    first_name: 'Mike',
    last_name: 'Johnson',
    email: 'mike.johnson@company.com',
    department: 'Sales',
    role: 'Sales Manager',
    salary: 75000,
    joining_date: '2020-06-10',
    status: 'Active',
    manager_id: null,
    phone: '555-0103'
  },
  {
    id: '4',
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.williams@company.com',
    department: 'HR',
    role: 'HR Specialist',
    salary: 55000,
    joining_date: '2021-09-05',
    status: 'On Leave',
    manager_id: null,
    phone: '555-0104'
  },
  {
    id: '5',
    first_name: 'Tom',
    last_name: 'Brown',
    email: 'tom.brown@company.com',
    department: 'Operations',
    role: 'Operations Manager',
    salary: 80000,
    joining_date: '2019-11-12',
    status: 'Active',
    manager_id: null,
    phone: '555-0105'
  }
];

export const mockPayrollRuns = [
  {
    id: '1',
    month: '2024-01',
    status: 'Processed',
    total_gross: 180000,
    total_deductions: 27000,
    total_net: 153000,
    processed_at: '2024-01-31T16:00:00Z'
  },
  {
    id: '2',
    month: '2024-02',
    status: 'Draft',
    total_gross: 185000,
    total_deductions: 27500,
    total_net: 157500,
    processed_at: null
  }
];

export const mockPayrollItems = [
  {
    id: '1',
    employee_id: '1',
    gross_pay: 85000,
    federal_tax: 12750,
    state_tax: 4250,
    social_security: 5270,
    medicare: 1233,
    health_insurance: 5000,
    retirement_401k: 4250,
    total_deductions: 27503,
    net_pay: 57497
  },
  {
    id: '2',
    employee_id: '2',
    gross_pay: 95000,
    federal_tax: 14250,
    state_tax: 4750,
    social_security: 5890,
    medicare: 1378,
    health_insurance: 5500,
    retirement_401k: 4750,
    total_deductions: 30518,
    net_pay: 64482
  }
];

export const mockLeaveRequests = [
  {
    id: '1',
    employee_id: '1',
    leave_type: 'vacation',
    start_date: '2024-02-01',
    end_date: '2024-02-05',
    status: 'approved',
    reason: 'Family vacation'
  },
  {
    id: '2',
    employee_id: '2',
    leave_type: 'sick',
    start_date: '2024-01-20',
    end_date: '2024-01-22',
    status: 'pending',
    reason: 'Medical appointment'
  }
];

export const mockAccountsReceivable = [
  {
    id: '1',
    customer_name: 'Client A',
    invoice_number: 'INV-001',
    amount: 45000,
    due_date: '2024-02-01',
    status: 'pending'
  },
  {
    id: '2',
    customer_name: 'Client B',
    invoice_number: 'INV-002',
    amount: 32000,
    due_date: '2024-01-25',
    status: 'paid'
  }
];

export const mockAccountsPayable = [
  {
    id: '1',
    invoice_number: 'AP-001',
    vendor_name: 'Acme Supplies',
    amount: 5000,
    due_date: '2024-02-15',
    status: 'Pending',
    description: 'Office supplies for Q1',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    invoice_number: 'AP-002',
    vendor_name: 'Global Materials',
    amount: 7500,
    due_date: '2024-02-20',
    status: 'Paid',
    description: 'Raw materials for production',
    created_at: '2024-01-20T14:30:00Z'
  }
];

export const mockChartOfAccounts = [
  {
    id: '1',
    account_code: '1000',
    account_name: 'Cash',
    account_type: 'asset',
    balance: 150000,
    is_active: true
  },
  {
    id: '2',
    account_code: '2000',
    account_name: 'Accounts Receivable',
    account_type: 'asset',
    balance: 85000,
    is_active: true
  },
  {
    id: '3',
    account_code: '3000',
    account_name: 'Accounts Payable',
    account_type: 'liability',
    balance: 45000,
    is_active: true
  }
];

export const mockJournalEntries = [
  {
    id: '1',
    entry_date: '2024-01-15',
    description: 'Monthly rent payment',
    debit_account: '5000',
    credit_account: '1000',
    amount: 5000,
    status: 'posted'
  },
  {
    id: '2',
    entry_date: '2024-01-10',
    description: 'Software purchase',
    debit_account: '1500',
    credit_account: '2000',
    amount: 2500,
    status: 'posted'
  }
];

export const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'In Progress',
    start_date: '2024-01-01',
    end_date: '2024-03-31',
    deadline: '2024-03-31',
    budget_planned: 50000,
    budget_actual: 32500,
    progress: 65
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'New mobile application for customer portal',
    status: 'Planning',
    start_date: '2024-02-01',
    end_date: '2024-06-30',
    deadline: '2024-06-30',
    budget_planned: 120000,
    budget_actual: 18000,
    progress: 15
  }
];

export const mockNotifications = [
  {
    id: '1',
    type: 'info',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight',
    read: false,
    module: 'system',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Low Inventory',
    message: 'Component B stock below reorder level',
    read: true,
    module: 'inventory',
    created_at: '2024-01-19T14:30:00Z'
  }
];

export const mockKpiData = [
  {
    id: '1',
    metric_key: 'revenue',
    metric_value: 450000,
    label: 'Monthly Revenue'
  },
  {
    id: '2',
    metric_key: 'expenses',
    metric_value: 320000,
    label: 'Monthly Expenses'
  },
  {
    id: '3',
    metric_key: 'profit',
    metric_value: 130000,
    label: 'Monthly Profit'
  },
  {
    id: '4',
    metric_key: 'customers',
    metric_value: 1250,
    label: 'Total Customers'
  }
];

export const mockActivities = [
  {
    id: '1',
    action: 'created',
    module: 'purchase_order',
    created_at: '2024-01-20T09:00:00Z'
  },
  {
    id: '2',
    action: 'updated',
    module: 'inventory',
    created_at: '2024-01-20T10:30:00Z'
  }
];

export const mockProducts = [
  {
    id: '1',
    sku: 'PROD-001',
    name: 'Raw Material A',
    unit_price: 25.50
  },
  {
    id: '2',
    sku: 'PROD-002',
    name: 'Component B',
    unit_price: 45.00
  },
  {
    id: '3',
    sku: 'PROD-003',
    name: 'Finished Product C',
    unit_price: 125.00
  }
];

export const mockVendors = [
  {
    id: '1',
    name: 'Acme Supplies',
    contact_name: 'John Smith',
    email: 'contact@acme.com',
    phone: '555-0101',
    address: '123 Main St, City, State',
    status: 'Active',
    rating: 4
  },
  {
    id: '2',
    name: 'Global Materials',
    contact_name: 'Jane Doe',
    email: 'info@global.com',
    phone: '555-0102',
    address: '456 Oak Ave, City, State',
    status: 'Active',
    rating: 5
  }
];

// Mock API functions that return promises to simulate async behavior
export const mockApi = {
  getPurchaseOrders: () => Promise.resolve({ data: mockPurchaseOrders, error: null }),
  getInventory: () => Promise.resolve({ data: mockInventory, error: null }),
  getEmployees: () => Promise.resolve({ data: mockEmployees, error: null }),
  getPayrollRuns: () => Promise.resolve({ data: mockPayrollRuns, error: null }),
  getPayrollItems: () => Promise.resolve({ data: mockPayrollItems, error: null }),
  getLeaveRequests: () => Promise.resolve({ data: mockLeaveRequests, error: null }),
  getLeaveBalances: () => Promise.resolve({ data: [], error: null }),
  getAccountsReceivable: () => Promise.resolve({ data: mockAccountsReceivable, error: null }),
  getAccountsPayable: () => Promise.resolve({ data: mockAccountsPayable, error: null }),
  getChartOfAccounts: () => Promise.resolve({ data: mockChartOfAccounts, error: null }),
  getJournalEntries: () => Promise.resolve({ data: mockJournalEntries, error: null }),
  getProjects: () => Promise.resolve({ data: mockProjects, error: null }),
  getNotifications: () => Promise.resolve({ data: mockNotifications, error: null }),
  getKpiData: () => Promise.resolve({ data: mockKpiData, error: null }),
  getActivities: () => Promise.resolve({ data: mockActivities, error: null }),
  getVendors: () => Promise.resolve({ data: mockVendors, error: null }),
  getProducts: () => Promise.resolve({ data: mockProducts, error: null }),
  getCompanySettings: () => Promise.resolve({ data: { timezone: 'America/New_York', currency: 'USD', date_format: 'MM/DD/YYYY', fiscal_year_start: '01-01' }, error: null }),
  getTenants: () => Promise.resolve({ data: { name: 'Demo Organization' }, error: null }),
  getMilestones: () => Promise.resolve({ data: [], error: null }),
  getTasks: () => Promise.resolve({ data: [], error: null }),
  getProjectMembers: () => Promise.resolve({ data: [], error: null }),
  getAuditLogs: () => Promise.resolve({ data: [], error: null }),
  getNotificationPreferences: () => Promise.resolve({ data: [], error: null }),
  getArPayments: () => Promise.resolve({ data: [], error: null }),
  getMonthlyRevenue: () => Promise.resolve({ data: [
    { month: '2024-01', revenue: 450000, target: 400000 },
    { month: '2024-02', revenue: 380000, target: 420000 },
    { month: '2024-03', revenue: 520000, target: 450000 },
    { month: '2024-04', revenue: 480000, target: 480000 }
  ], error: null }),
  getDepartmentExpenses: () => Promise.resolve({ data: [
    { department: 'Engineering', amount: 85000, budget: 90000 },
    { department: 'Sales', amount: 65000, budget: 70000 },
    { department: 'Marketing', amount: 45000, budget: 50000 },
    { department: 'Operations', amount: 55000, budget: 60000 }
  ], error: null }),
  
  // Mock functions for other operations
  insert: (table: string, data: any) => Promise.resolve({ data: { ...data, id: Date.now().toString() }, error: null }),
  update: (table: string, id: string, data: any) => Promise.resolve({ data: { ...data, id }, error: null }),
  delete: (table: string, id: string) => Promise.resolve({ data: null, error: null }),
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: (data: any) => Promise.resolve({ data: { ...data, id: Date.now().toString() }, error: null }),
    update: (data: any) => Promise.resolve({ data: { ...data, id: 'mock-id' }, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
  eq: () => ({ select: () => Promise.resolve({ data: [], error: null }) })
};
