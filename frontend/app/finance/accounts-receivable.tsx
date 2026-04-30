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
import { Plus, Search, Loader as Loader2, DollarSign, TrendingUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2 } from 'lucide-react';

interface ArInvoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  due_date: string;
  status: string;
  description: string;
  created_at: string;
  paid_amount?: number;
}

interface ArPayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  Sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  Paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  Overdue: { label: 'Overdue', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
};

export function AccountsReceivable() {
  const { profile } = useAuth();
  const [invoices, setInvoices] = React.useState<ArInvoice[]>([]);
  const [payments, setPayments] = React.useState<ArPayment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [invoiceDialogOpen, setInvoiceDialogOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<ArInvoice | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [invoiceForm, setInvoiceForm] = React.useState({
    customer_name: '',
    amount: '',
    due_date: '',
    description: '',
  });

  const [paymentForm, setPaymentForm] = React.useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    reference: '',
  });

  const fetchData = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const [invRes, payRes] = await Promise.all([
      mockApi.getAccountsReceivable(),
      mockApi.getArPayments(),
    ]);

    if (invRes.data) {
      const enriched = invRes.data.map((inv: any) => {
        const invPayments = (payRes.data || []).filter((p: any) => p.invoice_id === inv.id);
        return { ...inv, paid_amount: invPayments.reduce((s: number, p: any) => s + Number(p.amount), 0) };
      });
      setInvoices(enriched);
    }
    if (payRes.data) setPayments(payRes.data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = invoices.filter(
    (i) =>
      i.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      i.status.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + Number(i.amount) - (i.paid_amount || 0), 0);
  const totalOverdue = invoices
    .filter((i) => i.status === 'Overdue' || (i.status !== 'Paid' && new Date(i.due_date) < new Date()))
    .reduce((s, i) => s + Number(i.amount) - (i.paid_amount || 0), 0);
  const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalRevenue = invoices.reduce((s, i) => s + Number(i.amount), 0);

  const handleCreateInvoice = async () => {
    if (!profile?.tenant_id || !invoiceForm.customer_name || !invoiceForm.amount || !invoiceForm.due_date) return;
    setSaving(true);

    const nextNum = `AR-${String(invoices.length + 2001).padStart(4, '0')}`;

    // Mock insert operation
    await mockApi.insert('ar_invoices', {
      tenant_id: profile.tenant_id,
      invoice_number: nextNum,
      customer_name: invoiceForm.customer_name,
      amount: Number(invoiceForm.amount),
      due_date: invoiceForm.due_date,
      description: invoiceForm.description,
      status: 'Draft',
      created_by: profile.id,
    });

    setSaving(false);
    setInvoiceDialogOpen(false);
    setInvoiceForm({ customer_name: '', amount: '', due_date: '', description: '' });
    fetchData();
  };

  const openPaymentDialog = (invoice: ArInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: String(Number(invoice.amount) - (invoice.paid_amount || 0)),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'Bank Transfer',
      reference: '',
    });
    setPaymentDialogOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!profile?.tenant_id || !selectedInvoice || !paymentForm.amount) return;
    setSaving(true);

    // Mock insert operation
    await mockApi.insert('ar_payments', {
      tenant_id: profile.tenant_id,
      invoice_id: selectedInvoice.id,
      amount: Number(paymentForm.amount),
      payment_date: paymentForm.payment_date,
      payment_method: paymentForm.payment_method,
      reference: paymentForm.reference || null,
      created_by: profile.id,
    });

    const newPaidAmount = (selectedInvoice.paid_amount || 0) + Number(paymentForm.amount);
    const isFullyPaid = newPaidAmount >= Number(selectedInvoice.amount);

    // Mock update operation
    await mockApi.update('ar_invoices', selectedInvoice.id, {
      status: isFullyPaid ? 'Paid' : selectedInvoice.status,
      paid_at: isFullyPaid ? new Date().toISOString() : null,
    });

    setSaving(false);
    setPaymentDialogOpen(false);
    fetchData();
  };

  const updateStatus = async (invoice: ArInvoice, status: string) => {
    await mockApi.update('ar_invoices', invoice.id, { status });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Accounts Receivable</h2>
          <p className="text-sm text-muted-foreground">Manage customer invoices and payments</p>
        </div>
        <Button onClick={() => setInvoiceDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-lg font-bold">${totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
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
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right w-28">Amount</TableHead>
                      <TableHead className="text-right w-28">Balance</TableHead>
                      <TableHead className="w-28">Due Date</TableHead>
                      <TableHead className="w-24 text-center">Status</TableHead>
                      <TableHead className="w-40 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((inv) => {
                      const balance = Number(inv.amount) - (inv.paid_amount || 0);
                      const isOverdue = inv.status !== 'Paid' && new Date(inv.due_date) < new Date();
                      const displayStatus = isOverdue && inv.status !== 'Paid' ? 'Overdue' : inv.status;
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                          <TableCell className="font-medium">{inv.customer_name}</TableCell>
                          <TableCell className="text-right font-mono">${Number(inv.amount).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">${balance.toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                              {inv.due_date}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={statusConfig[displayStatus]?.color} variant="secondary">
                              {statusConfig[displayStatus]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            {inv.status === 'Draft' && (
                              <Button variant="outline" size="sm" onClick={() => updateStatus(inv, 'Sent')}>
                                Send
                              </Button>
                            )}
                            {inv.status !== 'Paid' && balance > 0 && (
                              <Button variant="outline" size="sm" onClick={() => openPaymentDialog(inv)}>
                                Record Payment
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((pay) => {
                    const inv = invoices.find((i) => i.id === pay.invoice_id);
                    return (
                      <TableRow key={pay.id}>
                        <TableCell>{pay.payment_date}</TableCell>
                        <TableCell className="font-mono text-sm">{inv?.invoice_number || '-'}</TableCell>
                        <TableCell className="text-right font-mono">${Number(pay.amount).toLocaleString()}</TableCell>
                        <TableCell>{pay.payment_method}</TableCell>
                        <TableCell className="text-muted-foreground">{pay.reference || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No payments recorded
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Customer Invoice</DialogTitle>
            <DialogDescription>Add a new accounts receivable invoice.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={invoiceForm.customer_name}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, customer_name: e.target.value }))}
                placeholder="e.g. GlobalTech Industries"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Invoice description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={saving || !invoiceForm.customer_name || !invoiceForm.amount || !invoiceForm.due_date}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Recording payment for ${selectedInvoice.invoice_number} - ${selectedInvoice.customer_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedInvoice && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Amount</span>
                  <span className="font-mono font-medium">${Number(selectedInvoice.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Already Paid</span>
                  <span className="font-mono font-medium">${(selectedInvoice.paid_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1 font-bold">
                  <span>Balance Due</span>
                  <span className="font-mono">${(Number(selectedInvoice.amount) - (selectedInvoice.paid_amount || 0)).toLocaleString()}</span>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, payment_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.payment_method}
                  onValueChange={(v) => setPaymentForm((f) => ({ ...f, payment_method: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference #</Label>
                <Input
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={saving || !paymentForm.amount}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
