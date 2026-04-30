'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
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
import { Plus, Search, Loader as Loader2, Star, Building2, Phone, Mail } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: string;
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!onChange}
        >
          <Star
            className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );
}

export function VendorManagement() {
  const { profile } = useAuth();
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    name: '', contact_name: '', email: '', phone: '', address: '', rating: 3,
  });

  const fetchVendors = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getVendors();
    if (data) setVendors(data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const filtered = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = vendors.filter((v) => v.status === 'Active').length;
  const avgRating = vendors.length > 0 ? (vendors.reduce((s, v) => s + v.rating, 0) / vendors.length).toFixed(1) : '0';
  const topRated = vendors.filter((v) => v.rating >= 4).length;

  const handleSave = async () => {
    if (!profile?.tenant_id || !form.name) return;
    setSaving(true);
    // Mock insert operation
    await mockApi.insert('vendors', {
      tenant_id: profile.tenant_id,
      name: form.name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      status: 'Active',
      created_by: profile.id,
    });
    setSaving(false);
    setDialogOpen(false);
    setForm({ name: '', contact_name: '', email: '', phone: '', address: '', rating: 3 });
    fetchVendors();
  };

  const updateRating = async (vendor: Vendor, rating: number) => {
    await mockApi.update('vendors', vendor.id, { rating });
    fetchVendors();
  };

  const toggleStatus = async (vendor: Vendor) => {
    const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
    await mockApi.update('vendors', vendor.id, { status: newStatus });
    fetchVendors();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Vendors</h2>
          <p className="text-sm text-muted-foreground">{vendors.length} vendors managed</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Vendor</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500"><Building2 className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Active Vendors</p><p className="text-lg font-bold">{activeCount}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500"><Star className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Avg Rating</p><p className="text-lg font-bold">{avgRating} / 5</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500"><Star className="h-5 w-5 text-white" /></div>
          <div><p className="text-xs text-muted-foreground">Top Rated (4+)</p><p className="text-lg font-bold">{topRated}</p></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id} className={v.status === 'Inactive' ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {v.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{v.name}</p>
                          {v.address && <p className="text-xs text-muted-foreground truncate max-w-40">{v.address}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{v.contact_name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {v.email || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {v.phone || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={v.rating} onChange={(r) => updateRating(v, r)} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={v.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'} variant="secondary">
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(v)}>
                        {v.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No vendors found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
            <DialogDescription>Add a new vendor or supplier to your network.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. TechSupply Inc." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input value={form.contact_name} onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1-555-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="contact@vendor.com" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="123 Business Ave" />
            </div>
            <div className="space-y-2">
              <Label>Initial Rating</Label>
              <StarRating rating={form.rating} onChange={(r) => setForm((f) => ({ ...f, rating: r }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
