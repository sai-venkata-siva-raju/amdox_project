'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi, mockEmployees, mockPayrollRuns, mockPayrollItems } from '@/lib/mock-data';
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
import { Separator } from '@/components/ui/separator';
import { Loader as Loader2, DollarSign, TrendingDown, Wallet, Download, Play, FileText } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  role: string;
  salary: number;
  status: string;
}

interface PayrollRun {
  id: string;
  month: string;
  status: string;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  processed_at: string | null;
}

interface PayrollItem {
  id: string;
  employee_id: string;
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  social_security: number;
  medicare: number;
  health_insurance: number;
  retirement_401k: number;
  total_deductions: number;
  net_pay: number;
  employee?: Employee;
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  Processed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export function Payroll() {
  const { profile } = useAuth();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [payrollRuns, setPayrollRuns] = React.useState<PayrollRun[]>([]);
  const [payrollItems, setPayrollItems] = React.useState<PayrollItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedMonth, setSelectedMonth] = React.useState('2026-04');
  const [selectedRun, setSelectedRun] = React.useState<PayrollRun | null>(null);
  const [payslipItem, setPayslipItem] = React.useState<PayrollItem | null>(null);
  const [payslipOpen, setPayslipOpen] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase calls
    const [empRes, runRes] = await Promise.all([
      mockApi.getEmployees(),
      mockApi.getPayrollRuns(),
    ]);

    if (empRes.data) setEmployees(empRes.data);
    if (runRes.data) setPayrollRuns(runRes.data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const fetchPayrollItems = React.useCallback(async (runId: string) => {
    // Use mock data instead of supabase calls
    const [itemRes, empRes] = await Promise.all([
      mockApi.getPayrollItems(),
      mockApi.getEmployees(),
    ]);

    const empMap: Record<string, Employee> = {};
    if (empRes.data) empRes.data.forEach((e: Employee) => { empMap[e.id] = e; });

    if (itemRes.data) {
      setPayrollItems(itemRes.data.map((i: any) => ({ ...i, employee: empMap[i.employee_id] })));
    }
  }, [profile?.tenant_id]);

  React.useEffect(() => {
    if (selectedRun) fetchPayrollItems(selectedRun.id);
  }, [selectedRun, fetchPayrollItems]);

  const handleRunPayroll = async () => {
    if (!profile?.tenant_id) return;
    setProcessing(true);

    const activeEmps = employees.filter((e) => e.status === 'Active');
    const monthlyGross = activeEmps.reduce((s, e) => s + Number(e.salary) / 12, 0);

    const items = activeEmps.map((emp) => {
      const gross = Number(emp.salary) / 12;
      const federalTax = gross * 0.22;
      const stateTax = gross * 0.05;
      const ss = gross * 0.062;
      const medicare = gross * 0.0145;
      const healthIns = 450;
      const retirement = gross * 0.05;
      const totalDeductions = federalTax + stateTax + ss + medicare + healthIns + retirement;
      const net = gross - totalDeductions;
      return { gross, federalTax, stateTax, ss, medicare, healthIns, retirement, totalDeductions, net, empId: emp.id };
    });

    const totalGross = items.reduce((s, i) => s + i.gross, 0);
    const totalDeductions = items.reduce((s, i) => s + i.totalDeductions, 0);
    const totalNet = items.reduce((s, i) => s + i.net, 0);

    // Mock insert operation
    const { data: run } = await mockApi.insert('payroll_runs', {
      tenant_id: profile.tenant_id,
      month: selectedMonth,
      status: 'Processed',
      total_gross: Math.round(totalGross * 100) / 100,
      total_deductions: Math.round(totalDeductions * 100) / 100,
      total_net: Math.round(totalNet * 100) / 100,
      processed_by: profile.id,
      processed_at: new Date().toISOString(),
    });

    if (run) {
      const payrollItemsData = items.map((i) => ({
        payroll_run_id: run.id,
        employee_id: i.empId,
        gross_pay: Math.round(i.gross * 100) / 100,
        federal_tax: Math.round(i.federalTax * 100) / 100,
        state_tax: Math.round(i.stateTax * 100) / 100,
        social_security: Math.round(i.ss * 100) / 100,
        medicare: Math.round(i.medicare * 100) / 100,
        health_insurance: i.healthIns,
        retirement_401k: Math.round(i.retirement * 100) / 100,
        total_deductions: Math.round(i.totalDeductions * 100) / 100,
        net_pay: Math.round(i.net * 100) / 100,
      }));
      await mockApi.insert('payroll_items', payrollItemsData);
    }

    setProcessing(false);
    fetchData();
  };

  const handleExport = () => {
    if (!payrollItems.length) return;
    const headers = ['Employee', 'Department', 'Gross Pay', 'Federal Tax', 'State Tax', 'Social Security', 'Medicare', 'Health Insurance', '401(k)', 'Total Deductions', 'Net Pay'];
    const rows = payrollItems.map((i) => [
      `${i.employee?.first_name} ${i.employee?.last_name}`,
      i.employee?.department || '',
      i.gross_pay, i.federal_tax, i.state_tax, i.social_security, i.medicare,
      i.health_insurance, i.retirement_401k, i.total_deductions, i.net_pay,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentRun = payrollRuns.find((r) => r.month === selectedMonth);
  const fmt = (n: number) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Payroll</h2>
          <p className="text-sm text-muted-foreground">Process monthly payroll and manage payslips</p>
        </div>
        <div className="flex gap-2">
          {payrollItems.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          )}
          {!currentRun && (
            <Button onClick={handleRunPayroll} disabled={processing}>
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Run Payroll
            </Button>
          )}
        </div>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium">Period:</Label>
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            const run = payrollRuns.find((r) => r.month === e.target.value);
            setSelectedRun(run || null);
          }}
          className="w-44"
        />
        {currentRun && (
          <Badge className={statusColors[currentRun.status]} variant="secondary">{currentRun.status}</Badge>
        )}
      </div>

      {/* Summary cards */}
      {currentRun && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Gross</p>
                <p className="text-lg font-bold">{fmt(currentRun.total_gross)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Deductions</p>
                <p className="text-lg font-bold">{fmt(currentRun.total_deductions)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Net Pay</p>
                <p className="text-lg font-bold">{fmt(currentRun.total_net)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {currentRun ? `Payroll Details - ${selectedMonth}` : 'No payroll run for this period'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : payrollItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Federal Tax</TableHead>
                  <TableHead className="text-right">State Tax</TableHead>
                  <TableHead className="text-right">SS + Medicare</TableHead>
                  <TableHead className="text-right">Health Ins</TableHead>
                  <TableHead className="text-right">401(k)</TableHead>
                  <TableHead className="text-right font-semibold">Net Pay</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.employee ? `${item.employee.first_name} ${item.employee.last_name}` : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.employee?.department || '-'}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(item.gross_pay)}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{fmt(item.federal_tax)}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{fmt(item.state_tax)}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{fmt(item.social_security + item.medicare)}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{fmt(item.health_insurance)}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">{fmt(item.retirement_401k)}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{fmt(item.net_pay)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setPayslipItem(item); setPayslipOpen(true); }}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wallet className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No payroll processed for {selectedMonth}</p>
              <p className="text-xs mt-1">Click "Run Payroll" to process</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslip Modal */}
      <Dialog open={payslipOpen} onOpenChange={setPayslipOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payslip - {selectedMonth}</DialogTitle>
            <DialogDescription>
              {payslipItem?.employee ? `${payslipItem.employee.first_name} ${payslipItem.employee.last_name}` : ''}
            </DialogDescription>
          </DialogHeader>
          {payslipItem && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee</span>
                  <span className="font-medium">{payslipItem.employee?.first_name} {payslipItem.employee?.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span>{payslipItem.employee?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Title</span>
                  <span>{payslipItem.employee?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pay Period</span>
                  <span>{selectedMonth}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Earnings</p>
                <div className="flex justify-between text-sm">
                  <span>Gross Pay</span>
                  <span className="font-mono">{fmt(payslipItem.gross_pay)}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold mb-2">Deductions</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Federal Tax (22%)</span>
                    <span className="font-mono text-muted-foreground">-{fmt(payslipItem.federal_tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>State Tax (5%)</span>
                    <span className="font-mono text-muted-foreground">-{fmt(payslipItem.state_tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Security (6.2%)</span>
                    <span className="font-mono text-muted-foreground">-{fmt(payslipItem.social_security)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medicare (1.45%)</span>
                    <span className="font-mono text-muted-foreground">-{fmt(payslipItem.medicare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Insurance</span>
                    <span className="font-mono text-muted-foreground">-{fmt(payslipItem.health_insurance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>401(k) (5%)</span>
                    <span className="font-mono text-muted-foreground">-{fmt(payslipItem.retirement_401k)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-bold">
                <span>Net Pay</span>
                <span className="font-mono">{fmt(payslipItem.net_pay)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayslipOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
