'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi, mockInventory } from '@/lib/mock-data';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Loader as Loader2, TriangleAlert as AlertTriangle, Package, ArrowDown, ArrowUp, Warehouse } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit_price: number;
  quantity_on_hand: number;
  reorder_point: number;
  warehouse_location: string;
}

function StockIndicator({ qty, reorder }: { qty: number; reorder: number }) {
  const ratio = reorder > 0 ? qty / reorder : 2;
  let color = 'bg-emerald-500';
  let label = 'In Stock';
  if (ratio <= 0.5) { color = 'bg-rose-500'; label = 'Critical'; }
  else if (ratio <= 1) { color = 'bg-amber-500'; label = 'Low'; }
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-sm">{qty}</span>
      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{label}</Badge>
    </div>
  );
}

export function Inventory() {
  const { profile } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [adjustDialogOpen, setAdjustDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [adjustForm, setAdjustForm] = React.useState({
    adjustment_type: 'In', quantity: '', reason: '',
  });

  const fetchProducts = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getInventory();
    if (data) setProducts(data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) =>
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = products.filter((p) => p.quantity_on_hand <= p.reorder_point);
  const criticalItems = products.filter((p) => p.quantity_on_hand <= p.reorder_point * 0.5);
  const totalItems = products.reduce((s, p) => s + p.quantity_on_hand, 0);
  const totalValue = products.reduce((s, p) => s + Number(p.unit_price) * p.quantity_on_hand, 0);

  const openAdjust = (product: Product) => {
    setSelectedProduct(product);
    setAdjustForm({ adjustment_type: 'In', quantity: '', reason: '' });
    setAdjustDialogOpen(true);
  };

  const handleAdjust = async () => {
    if (!profile?.tenant_id || !selectedProduct || !adjustForm.quantity) return;
    setSaving(true);
    const qty = Number(adjustForm.quantity);
    const newQty = adjustForm.adjustment_type === 'In'
      ? selectedProduct.quantity_on_hand + qty
      : Math.max(0, selectedProduct.quantity_on_hand - qty);

    // Mock update operations
    await mockApi.update('products', selectedProduct.id, { quantity_on_hand: newQty });
    await mockApi.insert('stock_adjustments', {
      tenant_id: profile.tenant_id,
      product_id: selectedProduct.id,
      adjustment_type: adjustForm.adjustment_type,
      quantity: qty,
      reason: adjustForm.reason,
      created_by: profile.id,
    });

    setSaving(false);
    setAdjustDialogOpen(false);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Inventory</h2>
          <p className="text-sm text-muted-foreground">{products.length} products tracked</p>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <span className="font-semibold">{lowStockItems.length} items</span> are at or below reorder point.
            {criticalItems.length > 0 && <span className="font-semibold text-rose-600 dark:text-rose-400"> {criticalItems.length} critical!</span>}
            {' '}
            Items: {lowStockItems.map((p) => p.sku).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500"><Package className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Total SKUs</p><p className="text-lg font-bold">{products.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500"><Warehouse className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Total Units</p><p className="text-lg font-bold">{totalItems.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500"><AlertTriangle className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-lg font-bold">{lowStockItems.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600"><DollarSign className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Inventory Value</p><p className="text-lg font-bold">${(totalValue / 1000).toFixed(0)}K</p></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">SKU</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right w-24">Unit Price</TableHead>
                  <TableHead className="w-36">Stock Level</TableHead>
                  <TableHead className="w-24 text-right">Reorder Pt</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className={p.quantity_on_hand <= p.reorder_point * 0.5 ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''}>
                    <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.description && <p className="text-xs text-muted-foreground truncate max-w-48">{p.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                    <TableCell className="text-right font-mono">${Number(p.unit_price).toLocaleString()}</TableCell>
                    <TableCell><StockIndicator qty={p.quantity_on_hand} reorder={p.reorder_point} /></TableCell>
                    <TableCell className="text-right text-sm">{p.reorder_point}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.warehouse_location}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setAdjustForm((f) => ({ ...f, adjustment_type: 'In' })); openAdjust(p); }}>
                          <ArrowUp className="h-3 w-3 mr-0.5" />In
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setAdjustForm((f) => ({ ...f, adjustment_type: 'Out' })); openAdjust(p); }}>
                          <ArrowDown className="h-3 w-3 mr-0.5" />Out
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock - {adjustForm.adjustment_type === 'In' ? 'Add' : 'Remove'}</DialogTitle>
            <DialogDescription>
              {selectedProduct && `${selectedProduct.sku} - ${selectedProduct.name} (Current: ${selectedProduct.quantity_on_hand})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Stock</span>
                <span className="font-mono font-medium">{selectedProduct?.quantity_on_hand}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Reorder Point</span>
                <span className="font-mono">{selectedProduct?.reorder_point}</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select value={adjustForm.adjustment_type} onValueChange={(v) => setAdjustForm((f) => ({ ...f, adjustment_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In">Stock In (Add)</SelectItem>
                    <SelectItem value="Out">Stock Out (Remove)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={adjustForm.quantity} onChange={(e) => setAdjustForm((f) => ({ ...f, quantity: e.target.value }))} min={1} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input value={adjustForm.reason} onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Received from PO-3001" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={saving || !adjustForm.quantity}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {adjustForm.adjustment_type === 'In' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
