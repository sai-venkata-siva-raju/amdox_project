'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Building2, Globe, DollarSign, Calendar, Loader as Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CompanySettings {
  id: string;
  timezone: string;
  currency: string;
  date_format: string;
  fiscal_year_start: string;
  logo_url: string | null;
}

export function CompanyProfile() {
  const { profile } = useAuth();
  const [settings, setSettings] = React.useState<CompanySettings | null>(null);
  const [tenantName, setTenantName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    timezone: 'America/New_York', currency: 'USD', date_format: 'MM/DD/YYYY', fiscal_year_start: '01-01',
  });

  const fetchData = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    const [settRes, tenRes] = await Promise.all([
      mockApi.getCompanySettings(),
      mockApi.getTenants(),
    ]);

    if (settRes.data) {
      setSettings(settRes.data);
      setForm({
        timezone: settRes.data.timezone,
        currency: settRes.data.currency,
        date_format: settRes.data.date_format,
        fiscal_year_start: settRes.data.fiscal_year_start,
      });
    }
    if (tenRes.data) setTenantName(tenRes.data.name);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!profile?.tenant_id) return;
    setSaving(true);
    if (settings) {
      await mockApi.update('company_settings', settings.id, {
        timezone: form.timezone,
        currency: form.currency,
        date_format: form.date_format,
        fiscal_year_start: form.fiscal_year_start,
        updated_at: new Date().toISOString(),
      });
    } else {
      await mockApi.insert('company_settings', {
        tenant_id: profile.tenant_id,
        timezone: form.timezone,
        currency: form.currency,
        date_format: form.date_format,
        fiscal_year_start: form.fiscal_year_start,
      });
    }
    setSaving(false);
    toast.success('Company settings saved successfully');
    fetchData();
  };

  if (loading) {
    return <Card><CardContent className="h-64 animate-pulse bg-muted/30 rounded-lg" /></Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Company Information
          </CardTitle>
          <CardDescription>Basic details about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl font-bold border-2 border-dashed border-muted-foreground/30">
              {tenantName ? tenantName[0].toUpperCase() : 'A'}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-3.5 w-3.5" /> Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground">SVG, PNG, or JPG (max 2MB)</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Company name" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" /> Regional Settings
          </CardTitle>
          <CardDescription>Configure timezone, currency, and date preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => setForm((f) => ({ ...f, timezone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={form.date_format} onValueChange={(v) => setForm((f) => ({ ...f, date_format: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Fiscal Year Start</Label>
              <Input value={form.fiscal_year_start} onChange={(e) => setForm((f) => ({ ...f, fiscal_year_start: e.target.value }))} placeholder="01-01" />
            </div>
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
