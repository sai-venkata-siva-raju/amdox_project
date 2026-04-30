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
import { Plus, Search, Loader as Loader2, DollarSign, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from 'lucide-react';

interface ApInvoice {
  id: string;
  invoice_number: string;
  vendor_name: string;
  amount: number;
  due_date: string;
  status: string;
  description: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  Pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  Approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  Paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
};

export function AccountsPayable() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = React.useState<ApInvoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    vendor_name: '',
    amount: '',
    due_date: '',
    description: '',
  });

  const fetchInvoices = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getAccountsPayable();
    if (data) setInvoices(data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const filtered = invoices.filter(
    (i) =>
      i.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      i.status.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalOverdue = invoices
    .filter((i) => i.status !== 'Paid' && new Date(i.due_date) < new Date())
    .reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + Number(i.amount), 0);
  const pendingCount = invoices.filter((i) => i.status === 'Pending').length;

  const handleSave = async () => {
    if (!profile?.tenant_id || !form.vendor_name || !form.amount || !form.due_date) return;
    setSaving(true);

    const nextNum = `AP-${String(invoices.length + 1001).padStart(4, '0')}`;

    // Mock insert operation
    await mockApi.insert('ap_invoices', {
      tenant_id: profile.tenant_id,
      invoice_number: nextNum,
      vendor_name: form.vendor_name,
      amount: Number(form.amount),
      due_date: form.due_date,
      description: form.description,
      status: 'Draft',
      created_by: profile.id,
    });

    setSaving(false);
    setDialogOpen(false);
    setForm({ vendor_name: '', amount: '', due_date: '', description: '' });
    fetchInvoices();
  };

  const updateStatus = async (invoice: ApInvoice, status: string) => {
    const updates: any = { status };
    if (status === 'Paid') updates.paid_at = new Date().toISOString();
    await mockApi.update('ap_invoices', invoice.id, updates);
    fetchInvoices();
  };

  // Aging buckets
  const now = new Date();
  const agingBuckets = [
    { label: 'Current', min: 0, max: 0 },
    { label: '1-30 days', min: 1, max: 30 },
    { label: '31-60 days', min: 31, max: 60 },
    { label: '61-90 days', min: 61, max: 90 },
    { label: '90+ days', min: 91, max: 9999 },
  ];

  const agingData = agingBuckets.map((bucket) => {
    const total = invoices
      .filter((i) => {
        if (i.status === 'Paid') return false;
        const daysPast = Math.floor((now.getTime() - new Date(i.due_date).getTime()) / 86400000);
        return daysPast >= bucket.min && daysPast <= bucket.max;
      })
      .reduce((s, i) => s + Number(i.amount), 0);
    return { ...bucket, total };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Accounts Payable</h2>
          <p className="text-sm text-muted-foreground">Manage vendor invoices and payments</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="text-lg font-bold">${totalOutstanding.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className="text-lg font-bold">${totalOverdue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Approval</p>
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
              <p className="text-xs text-muted-foreground">Paid (Total)</p>
              <p className="text-lg font-bold">${totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="aging">Aging Report</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">Invoice #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right w-28">Amount</TableHead>
                      <TableHead className="w-28">Due Date</TableHead>
                      <TableHead className="w-28 text-center">Status</TableHead>
                      <TableHead className="w-32 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((inv) => {
                      const isOverdue = inv.status !== 'Paid' && new Date(inv.due_date) < now;
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                          <TableCell className="font-medium">{inv.vendor_name}</TableCell>
                          <TableCell className="text-right font-mono">${Number(inv.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                              {inv.due_date}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={statusConfig[inv.status]?.color} variant="secondary">
                              {isOverdue && inv.status !== 'Paid' ? 'Overdue' : statusConfig[inv.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {inv.status === 'Draft' && (
                              <Button variant="outline" size="sm" onClick={() => updateStatus(inv, 'Pending')}>
                                Submit
                              </Button>
                            )}
                            {inv.status === 'Pending' && (
                              <Button variant="outline" size="sm" onClick={() => updateStatus(inv, 'Approved')}>
                                Approve
                              </Button>
                            )}
                            {inv.status === 'Approved' && (
                              <Button variant="outline" size="sm" onClick={() => updateStatus(inv, 'Paid')}>
                                Mark Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aging Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aging Bucket</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right w-24">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agingData.map((bucket) => (
                    <TableRow key={bucket.label}>
                      <TableCell className="font-medium">{bucket.label}</TableCell>
                      <TableCell className="text-right font-mono">${bucket.total.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {totalOutstanding > 0 ? ((bucket.total / totalOutstanding) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono">${totalOutstanding.toLocaleString()}</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Vendor Invoice</DialogTitle>
            <DialogDescription>Add a new accounts payable invoice.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input
                value={form.vendor_name}
                onChange={(e) => setForm((f) => ({ ...f, vendor_name: e.target.value }))}
                placeholder="e.g. TechSupply Inc."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Invoice description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.vendor_name || !form.amount || !form.due_date}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
