'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi, mockPurchaseOrders, mockVendors, mockProducts } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus, Search, Loader as Loader2, Trash2, FileText, CircleCheck as CheckCircle2, Circle as XCircle, Send, Package } from 'lucide-react';

interface Vendor { id: string; name: string; }
interface Product { id: string; sku: string; name: string; unit_price: number; }

interface PoLine {
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  vendor_name?: string;
  status: string;
  total_amount: number;
  notes: string;
  created_at: string;
  lines?: any[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  Submitted: { label: 'Submitted', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  Approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  Received: { label: 'Received', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  Closed: { label: 'Closed', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  Rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
};

export function PurchaseOrders() {
  const { profile } = useAuth();
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    vendor_id: '',
    notes: '',
    lines: [{ product_id: '', quantity: 1, unit_price: 0, total: 0 }] as PoLine[],
  });

  const fetchData = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    
    // Use mock data instead of supabase calls
    const [poRes, venRes, prodRes] = await Promise.all([
      mockApi.getPurchaseOrders(),
      mockApi.getVendors(),
      mockApi.getProducts(),
    ]);
    
    const venMap: Record<string, string> = {};
    if (venRes.data) { setVendors(venRes.data); venRes.data.forEach((v) => { venMap[v.id] = v.name; }); }
    if (prodRes.data) setProducts(prodRes.data);
    if (poRes.data) setOrders(poRes.data.map((po: any) => ({ ...po, vendor_name: venMap[po.vendor_id] || po.vendor_name })));
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = orders.filter((o) =>
    o.po_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.vendor_name || '').toLowerCase().includes(search.toLowerCase()) ||
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, { product_id: '', quantity: 1, unit_price: 0, total: 0 }] }));
  const removeLine = (idx: number) => { if (form.lines.length <= 1) return; setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) })); };

  const updateLine = (idx: number, field: keyof PoLine, value: any) => {
    setForm((f) => {
      const lines = f.lines.map((l, i) => {
        if (i !== idx) return l;
        const updated = { ...l, [field]: value };
        if (field === 'product_id') {
          const prod = products.find((p) => p.id === value);
          if (prod) { updated.unit_price = Number(prod.unit_price); }
        }
        updated.total = Number(updated.quantity) * Number(updated.unit_price);
        return updated;
      });
      return { ...f, lines };
    });
  };

  const grandTotal = form.lines.reduce((s, l) => s + l.total, 0);

  const openCreate = () => {
    setForm({ vendor_id: '', notes: '', lines: [{ product_id: '', quantity: 1, unit_price: 0, total: 0 }] });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!profile?.tenant_id || !form.vendor_id || form.lines.every((l) => !l.product_id)) return;
    setSaving(true);
    const nextNum = `PO-${String(orders.length + 3001).padStart(4, '0')}`;
    
    // Mock insert operation
    const { data: po } = await mockApi.insert('purchase_orders', {
      tenant_id: profile.tenant_id, po_number: nextNum, vendor_id: form.vendor_id,
      status: 'Draft', total_amount: grandTotal, notes: form.notes, created_by: profile.id,
    });

    if (po) {
      const lines = form.lines.filter((l) => l.product_id).map((l) => ({
        purchase_order_id: po.id, product_id: l.product_id,
        quantity: l.quantity, unit_price: l.unit_price, total: l.total,
      }));
      await mockApi.insert('purchase_order_lines', lines);
    }
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const updateStatus = async (po: PurchaseOrder, status: string) => {
    await mockApi.update('purchase_orders', po.id, { status });
    if (status === 'Received') {
      // Mock operation for updating inventory - simplified for demo
      console.log('Mock: Updating inventory for received order', po.id);
    }
    fetchData();
  };

  const draftCount = orders.filter((o) => o.status === 'Draft').length;
  const pendingCount = orders.filter((o) => o.status === 'Submitted').length;
  const totalValue = orders.filter((o) => !['Closed', 'Rejected'].includes(o.status)).reduce((s, o) => s + Number(o.total_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Purchase Orders</h2>
          <p className="text-sm text-muted-foreground">{orders.length} purchase orders</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> New PO</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500"><FileText className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Drafts</p><p className="text-lg font-bold">{draftCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500"><Send className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Pending Approval</p><p className="text-lg font-bold">{pendingCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500"><Package className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Open Value</p><p className="text-lg font-bold">${totalValue.toLocaleString()}</p></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search POs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right w-28">Amount</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-40 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-sm">{po.po_number}</TableCell>
                    <TableCell className="font-medium">{po.vendor_name}</TableCell>
                    <TableCell className="text-right font-mono">${Number(po.total_amount).toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={statusConfig[po.status]?.color} variant="secondary">{statusConfig[po.status]?.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-40 truncate">{po.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      {po.status === 'Draft' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(po, 'Submitted')}><Send className="h-3 w-3 mr-1" />Submit</Button>
                      )}
                      {po.status === 'Submitted' && (
                        <div className="flex gap-1 justify-end">
                          <Button variant="outline" size="sm" onClick={() => updateStatus(po, 'Approved')}><CheckCircle2 className="h-3 w-3 mr-1" />Approve</Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => updateStatus(po, 'Rejected')}><XCircle className="h-3 w-3 mr-1" />Reject</Button>
                        </div>
                      )}
                      {po.status === 'Approved' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(po, 'Received')}><Package className="h-3 w-3 mr-1" />Receive</Button>
                      )}
                      {po.status === 'Received' && (
                        <Button variant="outline" size="sm" onClick={() => updateStatus(po, 'Closed')}>Close</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No purchase orders found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create PO Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>Add line items and submit for approval.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Select value={form.vendor_id} onValueChange={(v) => setForm((f) => ({ ...f, vendor_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="PO notes" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Line Items</Label>
              <div className="grid gap-2 text-xs font-medium text-muted-foreground" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 32px' }}>
                <span>Product</span><span className="text-right">Qty</span><span className="text-right">Unit Price</span><span className="text-right">Total</span><span />
              </div>
              {form.lines.map((line, idx) => (
                <div key={idx} className="grid gap-2 items-center" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 32px' }}>
                  <Select value={line.product_id} onValueChange={(v) => updateLine(idx, 'product_id', v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" className="h-9 text-right" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', Number(e.target.value))} min={1} />
                  <Input type="number" className="h-9 text-right" value={line.unit_price} onChange={(e) => updateLine(idx, 'unit_price', Number(e.target.value))} min={0} step="0.01" />
                  <span className="text-right font-mono text-sm">${line.total.toLocaleString()}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLine(idx)} disabled={form.lines.length <= 1}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLine}><Plus className="mr-1 h-3.5 w-3.5" />Add Line</Button>
            </div>

            <div className="border-t pt-3 text-right">
              <span className="text-sm font-semibold">Grand Total: </span>
              <span className="text-lg font-bold font-mono">${grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.vendor_id || form.lines.every((l) => !l.product_id)}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
