'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Loader as Loader2, Pencil, Users, UserCheck, UserMinus } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joining_date: string;
  status: string;
  manager_id: string | null;
  phone: string | null;
  manager_name?: string;
}

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'On Leave': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Terminated: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

const departments = ['Engineering', 'Finance', 'Sales', 'HR', 'Operations', 'Marketing'];

export function EmployeeManagement() {
  const { profile } = useAuth();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [deptFilter, setDeptFilter] = React.useState('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editEmployee, setEditEmployee] = React.useState<Employee | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');

  const [form, setForm] = React.useState({
    first_name: '', last_name: '', email: '', department: 'Engineering',
    role: '', salary: '', joining_date: '', status: 'Active', phone: '', manager_id: 'none',
  });

  const fetchEmployees = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getEmployees();
    if (data) {
      const managerMap: Record<string, string> = {};
      data.forEach((e: Employee) => { managerMap[e.id] = `${e.first_name} ${e.last_name}`; });
      const enriched = data.map((e: Employee) => ({
        ...e,
        manager_name: e.manager_id ? managerMap[e.manager_id] || '' : '',
      }));
      setEmployees(enriched);
    }
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const filtered = employees.filter((e) => {
    const matchesSearch =
      `${e.first_name} ${e.last_name} ${e.email} ${e.role}`.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const openCreate = () => {
    setEditEmployee(null);
    setForm({ first_name: '', last_name: '', email: '', department: 'Engineering', role: '', salary: '', joining_date: new Date().toISOString().split('T')[0], status: 'Active', phone: '', manager_id: 'none' });
    setDialogOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setForm({
      first_name: emp.first_name, last_name: emp.last_name, email: emp.email,
      department: emp.department, role: emp.role, salary: String(emp.salary),
      joining_date: emp.joining_date, status: emp.status, phone: emp.phone || '',
      manager_id: emp.manager_id || 'none',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!profile?.tenant_id || !form.first_name || !form.last_name || !form.email) return;
    setSaving(true);
    const payload = {
      tenant_id: profile.tenant_id,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      department: form.department,
      role: form.role,
      salary: Number(form.salary),
      joining_date: form.joining_date,
      status: form.status,
      phone: form.phone || null,
      manager_id: form.manager_id === 'none' ? null : form.manager_id,
    };

    // Mock update/insert operations
    if (editEmployee) {
      await mockApi.update('employees', editEmployee.id, payload);
    } else {
      await mockApi.insert('employees', payload);
    }
    setSaving(false);
    setDialogOpen(false);
    fetchEmployees();
  };

  const activeCount = employees.filter((e) => e.status === 'Active').length;
  const onLeaveCount = employees.filter((e) => e.status === 'On Leave').length;
  const totalSalary = employees.filter((e) => e.status === 'Active').reduce((s, e) => s + Number(e.salary), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Employees</h2>
          <p className="text-sm text-muted-foreground">{employees.length} total employees</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
              <UserMinus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">On Leave</p>
              <p className="text-lg font-bold">{onLeaveCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Payroll</p>
              <p className="text-lg font-bold">${(totalSalary / 1000).toFixed(0)}K/yr</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-md p-0.5">
          <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2 text-xs" onClick={() => setViewMode('table')}>Table</Button>
          <Button variant={viewMode === 'cards' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2 text-xs" onClick={() => setViewMode('cards')}>Cards</Button>
        </div>
      </div>

      {/* Table view */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead>Reports To</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {emp.first_name[0]}{emp.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{emp.first_name} {emp.last_name}</p>
                            <p className="text-xs text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell className="text-sm">{emp.role}</TableCell>
                      <TableCell className="text-right font-mono text-sm">${Number(emp.salary).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{emp.joining_date}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{emp.manager_name || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={statusColors[emp.status]} variant="secondary">{emp.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No employees found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Card view */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((emp) => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{emp.first_name} {emp.last_name}</p>
                      <p className="text-xs text-muted-foreground">{emp.role}</p>
                    </div>
                  </div>
                  <Badge className={statusColors[emp.status]} variant="secondary">{emp.status}</Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span>{emp.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary</span>
                    <span className="font-mono">${Number(emp.salary).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span>{emp.joining_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reports To</span>
                    <span>{emp.manager_name || '-'}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => openEdit(emp)}>Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
            <DialogDescription>
              {editEmployee ? 'Update employee information.' : 'Add a new employee to the organization.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Senior Developer" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Annual Salary</Label>
                <Input type="number" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} placeholder="0" min={0} />
              </div>
              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input type="date" value={form.joining_date} onChange={(e) => setForm((f) => ({ ...f, joining_date: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reports To</Label>
              <Select value={form.manager_id} onValueChange={(v) => setForm((f) => ({ ...f, manager_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {employees
                    .filter((e) => e.id !== editEmployee?.id)
                    .map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} - {e.role}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.first_name || !form.last_name || !form.email}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editEmployee ? 'Update' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
