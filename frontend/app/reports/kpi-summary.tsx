'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TriangleAlert as AlertTriangle, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface KpiData {
  kpi_name: string;
  actual: number;
  target: number;
  period: string;
}

interface TopProduct {
  id: string;
  sku: string;
  name: string;
  unit_price: number;
  quantity_on_hand: number;
  revenue_potential: number;
}

interface CostAlert {
  department: string;
  amount: number;
  budget: number;
  variance: number;
  variancePct: number;
}

export function KpiSummary() {
  const { profile } = useAuth();
  const [kpis, setKpis] = React.useState<KpiData[]>([]);
  const [topProducts, setTopProducts] = React.useState<TopProduct[]>([]);
  const [costAlerts, setCostAlerts] = React.useState<CostAlert[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!profile?.tenant_id) return;

    const fetchAll = async () => {
      const [kpiRes, prodRes, expRes] = await Promise.all([
        supabase.from('kpi_targets').select('*').eq('tenant_id', profile.tenant_id).eq('period', '2026-04'),
        supabase.from('products').select('id, sku, name, unit_price, quantity_on_hand').eq('tenant_id', profile.tenant_id),
        supabase.from('department_expenses').select('*').eq('tenant_id', profile.tenant_id).eq('month', '2026-04'),
      ]);

      if (kpiRes.data) setKpis(kpiRes.data);

      if (prodRes.data) {
        const sorted = prodRes.data
          .map((p: any) => ({ ...p, revenue_potential: Number(p.unit_price) * Number(p.quantity_on_hand) }))
          .sort((a: any, b: any) => b.revenue_potential - a.revenue_potential)
          .slice(0, 5);
        setTopProducts(sorted);
      }

      if (expRes.data) {
        const alerts = expRes.data
          .map((e: any) => ({
            department: e.department,
            amount: Number(e.amount),
            budget: Number(e.budget),
            variance: Number(e.amount) - Number(e.budget),
            variancePct: ((Number(e.amount) - Number(e.budget)) / Number(e.budget)) * 100,
          }))
          .filter((a) => a.variance > 0);
        setCostAlerts(alerts);
      }

      setLoading(false);
    };

    fetchAll();
  }, [profile?.tenant_id]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}><CardContent className="h-32 animate-pulse bg-muted/30 rounded-lg" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue vs Target Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" /> KPI Performance - April 2026
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {kpis.map((kpi) => {
            const pct = kpi.target > 0 ? Math.min((kpi.actual / kpi.target) * 100, 150) : 0;
            const isAbove = kpi.actual >= kpi.target;
            const isDollar = kpi.kpi_name === 'Monthly Revenue';
            const fmtVal = isDollar ? `$${(kpi.actual / 1000).toFixed(0)}K` : kpi.actual.toFixed(1);
            const fmtTgt = isDollar ? `$${(kpi.target / 1000).toFixed(0)}K` : kpi.target.toFixed(1);

            return (
              <div key={kpi.kpi_name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{kpi.kpi_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{fmtVal}</span>
                    <span className="text-muted-foreground">/ {fmtTgt}</span>
                    <Badge
                      className={isAbove
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'}
                      variant="secondary"
                    >
                      {isAbove ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                      {pct.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={Math.min(pct, 100)} className={`h-2 ${isAbove ? '[&>div]:bg-emerald-500' : '[&>div]:bg-rose-500'}`} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Cost Variance Alerts */}
      {costAlerts.length > 0 && (
        <Alert className="border-rose-300 bg-rose-50 dark:bg-rose-950/20">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <AlertDescription className="text-rose-800 dark:text-rose-200">
            <span className="font-semibold">{costAlerts.length} departments</span> exceeded budget this month:
            {' '}{costAlerts.map((a) => `${a.department} (+${a.variancePct.toFixed(0)}%)`).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Top 5 Products */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Top 5 Products by Inventory Value</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Qty on Hand</TableHead>
                <TableHead className="text-right font-semibold">Inventory Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-right font-mono">${Number(p.unit_price).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{p.quantity_on_hand}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${p.revenue_potential.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Department Cost Variance Detail */}
      {costAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" /> Cost Variance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Variance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costAlerts.map((a) => (
                  <TableRow key={a.department}>
                    <TableCell className="font-medium">{a.department}</TableCell>
                    <TableCell className="text-right font-mono">${(a.budget / 1000).toFixed(0)}K</TableCell>
                    <TableCell className="text-right font-mono">${(a.amount / 1000).toFixed(0)}K</TableCell>
                    <TableCell className="text-right font-mono text-rose-600 dark:text-rose-400">
                      +${(a.variance / 1000).toFixed(0)}K
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" variant="secondary">
                        +{a.variancePct.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
