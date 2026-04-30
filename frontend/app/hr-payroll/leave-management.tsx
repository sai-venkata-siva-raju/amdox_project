'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader as Loader2, CalendarDays, CircleCheck as CheckCircle2, Circle as XCircle, Clock } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  employee?: Employee;
}

interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type: string;
  total_days: number;
  used_days: number;
  employee?: Employee;
}

const leaveTypeColors: Record<string, string> = {
  Sick: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  Vacation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Personal: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Maternity: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Paternity: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
};

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

export function LeaveManagement() {
  const { profile } = useAuth();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [requests, setRequests] = React.useState<LeaveRequest[]>([]);
  const [balances, setBalances] = React.useState<LeaveBalance[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    employee_id: '', leave_type: 'Vacation', start_date: '', end_date: '', reason: '',
  });

  const fetchData = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    const [empRes, reqRes, balRes] = await Promise.all([
      mockApi.getEmployees(),
      mockApi.getLeaveRequests(),
      mockApi.getLeaveBalances(),
    ]);

    const empMap: Record<string, Employee> = {};
    if (empRes.data) {
      setEmployees(empRes.data);
      empRes.data.forEach((e: Employee) => { empMap[e.id] = e; });
    }

    if (reqRes.data) {
      setRequests(reqRes.data.map((r: any) => ({ ...r, employee: empMap[r.employee_id] })));
    }
    if (balRes.data) {
      setBalances(balRes.data.map((b: any) => ({ ...b, employee: empMap[b.employee_id] })));
    }
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const totalDaysRequested = requests.filter((r) => r.status === 'Approved').reduce((s, r) => {
    const days = Math.ceil((new Date(r.end_date).getTime() - new Date(r.start_date).getTime()) / 86400000) + 1;
    return s + days;
  }, 0);

  const handleSave = async () => {
    if (!profile?.tenant_id || !form.employee_id || !form.start_date || !form.end_date) return;
    setSaving(true);
    // Mock insert operation
    await mockApi.insert('leave_requests', {
      tenant_id: profile.tenant_id,
      employee_id: form.employee_id,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
      status: 'Pending',
    });
    setSaving(false);
    setDialogOpen(false);
    setForm({ employee_id: '', leave_type: 'Vacation', start_date: '', end_date: '', reason: '' });
    fetchData();
  };

  const updateRequestStatus = async (req: LeaveRequest, status: string) => {
    const updates: any = { status };
    if (status === 'Approved') {
      updates.approved_by = req.employee_id;
      const days = Math.ceil((new Date(req.end_date).getTime() - new Date(req.start_date).getTime()) / 86400000) + 1;
      const bal = balances.find((b) => b.employee_id === req.employee_id && b.leave_type === req.leave_type);
      if (bal) {
        await mockApi.update('leave_balances', bal.id, { used_days: Number(bal.used_days) + days });
      }
    }
    await mockApi.update('leave_requests', req.id, updates);
    fetchData();
  };

  // Group balances by employee
  const balanceByEmployee = balances.reduce((acc, b) => {
    if (!acc[b.employee_id]) acc[b.employee_id] = { employee: b.employee, balances: [] };
    acc[b.employee_id].balances.push(b);
    return acc;
  }, {} as Record<string, { employee?: Employee; balances: LeaveBalance[] }>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Leave Management</h2>
          <p className="text-sm text-muted-foreground">Request, approve, and track employee leave</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Request Leave</Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-lg font-bold">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days Approved (YTD)</p>
              <p className="text-lg font-bold">{totalDaysRequested}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => {
                      const days = Math.ceil((new Date(req.end_date).getTime() - new Date(req.start_date).getTime()) / 86400000) + 1;
                      return (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">
                            {req.employee ? `${req.employee.first_name} ${req.employee.last_name}` : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge className={leaveTypeColors[req.leave_type]} variant="secondary">{req.leave_type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{req.start_date}</TableCell>
                          <TableCell className="text-sm">{req.end_date}</TableCell>
                          <TableCell className="text-center">{days}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-32 truncate">{req.reason || '-'}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={statusColors[req.status]} variant="secondary">{req.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {req.status === 'Pending' && (
                              <div className="flex gap-1 justify-end">
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => updateRequestStatus(req, 'Approved')}>
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 text-xs text-destructive" onClick={() => updateRequestStatus(req, 'Rejected')}>
                                  <XCircle className="h-3 w-3 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {requests.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No leave requests</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Balances - {new Date().getFullYear()}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Used</TableHead>
                    <TableHead className="text-center">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(balanceByEmployee).map(({ employee, balances: empsBalances }) =>
                    empsBalances.map((b, idx) => (
                      <TableRow key={b.id}>
                        {idx === 0 ? (
                          <TableCell rowSpan={empsBalances.length} className="font-medium align-top">
                            {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown'}
                          </TableCell>
                        ) : null}
                        {idx === 0 ? (
                          <TableCell rowSpan={empsBalances.length} className="text-muted-foreground align-top">
                            {employee?.department || '-'}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <Badge className={leaveTypeColors[b.leave_type]} variant="secondary">{b.leave_type}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{b.total_days}</TableCell>
                        <TableCell className="text-center">{Number(b.used_days)}</TableCell>
                        <TableCell className="text-center font-medium">
                          {b.total_days - Number(b.used_days)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {Object.keys(balanceByEmployee).length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No leave balances</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Leave Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>Submit a new leave request for approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={form.employee_id} onValueChange={(v) => setForm((f) => ({ ...f, employee_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} - {e.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={form.leave_type} onValueChange={(v) => setForm((f) => ({ ...f, leave_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                  <SelectItem value="Sick">Sick</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Maternity">Maternity</SelectItem>
                  <SelectItem value="Paternity">Paternity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Optional reason" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.employee_id || !form.start_date || !form.end_date}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
