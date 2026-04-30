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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Loader as Loader2, Pencil } from 'lucide-react';

interface Account {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  balance: number;
  is_active: boolean;
}

const typeColors: Record<string, string> = {
  Asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Liability: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  Equity: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Revenue: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Expense: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

export function ChartOfAccounts() {
  const { profile } = useAuth();
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editAccount, setEditAccount] = React.useState<Account | null>(null);
  const [form, setForm] = React.useState({ code: '', name: '', type: 'Asset' });
  const [saving, setSaving] = React.useState(false);

  const fetchAccounts = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getChartOfAccounts();
    if (data) setAccounts(data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const filtered = accounts.filter(
    (a) =>
      a.account_code.toLowerCase().includes(search.toLowerCase()) ||
      a.account_name.toLowerCase().includes(search.toLowerCase()) ||
      a.account_type.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditAccount(null);
    setForm({ code: '', name: '', type: 'Asset' });
    setDialogOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditAccount(account);
    setForm({ code: account.account_code, name: account.account_name, type: account.account_type });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!profile?.tenant_id || !form.code || !form.name) return;
    setSaving(true);

    // Mock update/insert operations
    if (editAccount) {
      await mockApi.update('chart_of_accounts', editAccount.id, { account_code: form.code, account_name: form.name, account_type: form.type });
    } else {
      await mockApi.insert('chart_of_accounts', {
        tenant_id: profile.tenant_id,
        account_code: form.code,
        account_name: form.name,
        account_type: form.type,
      });
    }

    setSaving(false);
    setDialogOpen(false);
    fetchAccounts();
  };

  const toggleActive = async (account: Account) => {
    await mockApi.update('chart_of_accounts', account.id, { is_active: !account.is_active });
    fetchAccounts();
  };

  const totalByType = (type: string) =>
    accounts.filter((a) => a.account_type === type).reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Chart of Accounts</h2>
          <p className="text-sm text-muted-foreground">{accounts.length} accounts configured</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((type) => (
          <Card key={type}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">{type}</p>
              <p className="text-lg font-bold">${totalByType(type).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
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
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead className="w-28">Type</TableHead>
                  <TableHead className="text-right w-36">Balance</TableHead>
                  <TableHead className="w-24 text-center">Active</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((account) => (
                  <TableRow key={account.id} className={!account.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-mono text-sm">{account.account_code}</TableCell>
                    <TableCell className="font-medium">{account.account_name}</TableCell>
                    <TableCell>
                      <Badge className={typeColors[account.account_type]} variant="secondary">
                        {account.account_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${Number(account.balance).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={account.is_active}
                        onCheckedChange={() => toggleActive(account)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(account)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No accounts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
            <DialogDescription>
              {editAccount ? 'Update account details below.' : 'Create a new general ledger account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Account Code</Label>
              <Input
                placeholder="e.g. 1000"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                placeholder="e.g. Cash"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.code || !form.name}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editAccount ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
