'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface RevenueData { month: string; revenue: number; target: number; }
interface ExpenseData { department: string; amount: number; budget: number; }
interface InventoryCatData { category: string; value: number; }
interface HeadcountData { month: string; headcount: number; }

export function DashboardCharts() {
  const { profile } = useAuth();
  const [revenueData, setRevenueData] = React.useState<RevenueData[]>([]);
  const [expenseData, setExpenseData] = React.useState<ExpenseData[]>([]);
  const [inventoryData, setInventoryData] = React.useState<InventoryCatData[]>([]);
  const [headcountData, setHeadcountData] = React.useState<HeadcountData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!profile?.tenant_id) return;

    const fetchAll = async () => {
      // Use mock data instead of supabase
      const [revRes, expRes, prodRes] = await Promise.all([
        mockApi.getMonthlyRevenue(),
        mockApi.getDepartmentExpenses(),
        mockApi.getInventory(),
      ]);

      if (revRes.data) {
        setRevenueData(revRes.data.map((r: any) => ({
          month: r.month.slice(5),
          revenue: Number(r.revenue) / 1000,
          target: Number(r.target) / 1000,
        })));
      }

      if (expRes.data) {
        setExpenseData(expRes.data.map((e: any) => ({
          department: e.department,
          amount: Number(e.amount) / 1000,
          budget: Number(e.budget) / 1000,
        })));
      }

      if (prodRes.data) {
        const catMap: Record<string, number> = {};
        prodRes.data.forEach((p: any) => {
          const val = Number(p.quantity_on_hand) * Number(p.unit_price);
          catMap[p.category] = (catMap[p.category] || 0) + val;
        });
        setInventoryData(Object.entries(catMap).map(([category, value]) => ({ category, value: Math.round(value / 1000) })));
      }

      // Headcount growth (simulated from employee joining dates)
      const { data: empData } = await mockApi.getEmployees();

      if (empData) {
        const months = ['2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04'];
        const hcData = months.map((m, idx) => {
          const count = empData.filter((e: any) => e.joining_date <= `${m}-31`).length;
          return { month: m.slice(5), headcount: count || (8 + idx) };
        });
        setHeadcountData(hcData);
      }

      setLoading(false);
    };

    fetchAll();
  }, [profile?.tenant_id]);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}><CardContent className="h-72 animate-pulse bg-muted/30 rounded-lg" /></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Revenue Line Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Monthly Revenue vs Target</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${v}K`} />
              <Tooltip formatter={(v: number) => [`$${v}K`, '']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
              <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Expenses Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Department Expenses vs Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `$${v}K`} />
              <Tooltip formatter={(v: number) => [`$${v}K`, '']} />
              <Legend />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actual" />
              <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Budget" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Inventory Category Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Inventory Value by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={inventoryData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="category"
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
              >
                {inventoryData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`$${v}K`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Employee Headcount Area Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Employee Headcount Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={headcountData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip />
              <defs>
                <linearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="headcount" stroke="#10b981" strokeWidth={2} fill="url(#headGrad)" name="Headcount" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
