'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Loader as Loader2, Trash2, CircleCheck as CheckCircle2 } from 'lucide-react';

interface Account {
  id: string;
  account_code: string;
  account_name: string;
}

interface JournalEntry {
  id: string;
  entry_number: string;
  description: string;
  entry_date: string;
  period: string;
  is_posted: boolean;
  lines: JournalLine[];
}

interface JournalLine {
  id?: string;
  account_id: string;
  account_code?: string;
  account_name?: string;
  description: string;
  debit: number;
  credit: number;
}

export function JournalEntries() {
  const { profile } = useAuth();
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [closePeriodOpen, setClosePeriodOpen] = React.useState(false);
  const [currentPeriod, setCurrentPeriod] = React.useState('2026-04');

  const [form, setForm] = React.useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    period: '2026-04',
    lines: [
      { account_id: '', description: '', debit: 0, credit: 0 },
      { account_id: '', description: '', debit: 0, credit: 0 },
    ] as JournalLine[],
  });

  const fetchData = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    const [entryRes, acctRes] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('*, journal_entry_lines(*)')
        .eq('tenant_id', profile.tenant_id)
        .order('entry_date', { ascending: false }),
      supabase
        .from('chart_of_accounts')
        .select('id, account_code, account_name')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)
        .order('account_code'),
    ]);

    if (entryRes.data) {
      const enriched = entryRes.data.map((e: any) => ({
        ...e,
        lines: (e.journal_entry_lines || []).map((l: any) => {
          const acct = acctRes.data?.find((a: any) => a.id === l.account_id);
          return { ...l, account_code: acct?.account_code, account_name: acct?.account_name };
        }),
      }));
      setEntries(enriched);
    }
    if (acctRes.data) setAccounts(acctRes.data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const totalDebits = form.lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredits = form.lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

  const addLine = () => {
    setForm((f) => ({
      ...f,
      lines: [...f.lines, { account_id: '', description: '', debit: 0, credit: 0 }],
    }));
  };

  const removeLine = (idx: number) => {
    if (form.lines.length <= 2) return;
    setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));
  };

  const updateLine = (idx: number, field: keyof JournalLine, value: any) => {
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    }));
  };

  const openCreate = () => {
    setForm({
      description: '',
      date: new Date().toISOString().split('T')[0],
      period: currentPeriod,
      lines: [
        { account_id: '', description: '', debit: 0, credit: 0 },
        { account_id: '', description: '', debit: 0, credit: 0 },
      ],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!profile?.tenant_id || !isBalanced) return;
    setSaving(true);

    const nextNum = `JE-${String(entries.length + 1).padStart(4, '0')}`;

    const { data: entry, error: entryErr } = await supabase
      .from('journal_entries')
      .insert({
        tenant_id: profile.tenant_id,
        entry_number: nextNum,
        description: form.description,
        entry_date: form.date,
        period: form.period,
        created_by: profile.id,
      })
      .select('id')
      .maybeSingle();

    if (entryErr || !entry) {
      setSaving(false);
      return;
    }

    const lines = form.lines
      .filter((l) => l.account_id && (Number(l.debit) > 0 || Number(l.credit) > 0))
      .map((l) => ({
        journal_entry_id: entry.id,
        account_id: l.account_id,
        description: l.description,
        debit: Number(l.debit),
        credit: Number(l.credit),
      }));

    await supabase.from('journal_entry_lines').insert(lines);

    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const handlePost = async (entry: JournalEntry) => {
    await supabase.from('journal_entries').update({ is_posted: true }).eq('id', entry.id);
    fetchData();
  };

  const handleClosePeriod = async () => {
    if (!profile?.tenant_id) return;
    await supabase
      .from('fiscal_periods')
      .update({ is_closed: true, closed_by: profile.id, closed_at: new Date().toISOString() })
      .eq('tenant_id', profile.tenant_id)
      .eq('period', currentPeriod);
    setClosePeriodOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Journal Entries</h2>
          <p className="text-sm text-muted-foreground">Double-entry bookkeeping with debit and credit validation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setClosePeriodOpen(true)}>
            Close Period
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      </div>

      {/* Period info */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium">Current Period</p>
            <p className="text-lg font-bold">{currentPeriod}</p>
          </div>
          <Badge variant="secondary">Open</Badge>
        </CardContent>
      </Card>

      {/* Entries table */}
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
                  <TableHead className="w-28">Entry #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead className="w-20">Period</TableHead>
                  <TableHead className="text-right w-28">Debits</TableHead>
                  <TableHead className="text-right w-28">Credits</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const dr = entry.lines.reduce((s, l) => s + Number(l.debit), 0);
                  const cr = entry.lines.reduce((s, l) => s + Number(l.credit), 0);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">{entry.entry_number}</TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell className="text-sm">{entry.entry_date}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.period}</TableCell>
                      <TableCell className="text-right font-mono">${dr.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">${cr.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {entry.is_posted ? (
                          <Badge className="bg-emerald-100 text-emerald-800" variant="secondary">Posted</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!entry.is_posted && (
                          <Button variant="ghost" size="sm" onClick={() => handlePost(entry)}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No journal entries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
            <DialogDescription>
              Add debit and credit lines. Total debits must equal total credits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Entry description"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Input
                  placeholder="2026-04"
                  value={form.period}
                  onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                />
              </div>
            </div>

            {/* Lines */}
            <div className="space-y-2">
              <div className="grid gap-2 text-xs font-medium text-muted-foreground"
                style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 32px' }}
              >
                <span>Account</span>
                <span>Description</span>
                <span className="text-right">Debit</span>
                <span className="text-right">Credit</span>
                <span />
              </div>
              {form.lines.map((line, idx) => (
                <div key={idx} className="grid gap-2 items-center"
                  style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 32px' }}
                >
                  <Select
                    value={line.account_id}
                    onValueChange={(v) => updateLine(idx, 'account_id', v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.account_code} - {a.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-9"
                    value={line.description}
                    onChange={(e) => updateLine(idx, 'description', e.target.value)}
                    placeholder="Line description"
                  />
                  <Input
                    type="number"
                    className="h-9 text-right"
                    value={line.debit || ''}
                    onChange={(e) => updateLine(idx, 'debit', Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    step="0.01"
                  />
                  <Input
                    type="number"
                    className="h-9 text-right"
                    value={line.credit || ''}
                    onChange={(e) => updateLine(idx, 'credit', Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    step="0.01"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeLine(idx)}
                    disabled={form.lines.length <= 2}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLine}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Line
              </Button>
            </div>

            {/* Totals */}
            <div className="grid gap-2 border-t pt-3"
              style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 32px' }}
            >
              <span />
              <span className="text-sm font-semibold text-right">Totals</span>
              <span className={`text-sm font-bold font-mono text-right ${!isBalanced && totalDebits > 0 ? 'text-destructive' : ''}`}>
                ${totalDebits.toLocaleString()}
              </span>
              <span className={`text-sm font-bold font-mono text-right ${!isBalanced && totalCredits > 0 ? 'text-destructive' : ''}`}>
                ${totalCredits.toLocaleString()}
              </span>
            </div>
            {!isBalanced && (totalDebits > 0 || totalCredits > 0) && (
              <p className="text-xs text-destructive">
                Debits must equal credits. Difference: ${Math.abs(totalDebits - totalCredits).toFixed(2)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !isBalanced || !form.description}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Period Confirmation */}
      <AlertDialog open={closePeriodOpen} onOpenChange={setClosePeriodOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Period {currentPeriod}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Once a period is closed, no further journal entries
              can be posted to it. Make sure all entries for this period have been reviewed and posted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClosePeriod}>
              Close Period
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
