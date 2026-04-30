'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';

const DashboardCharts = dynamic(() => import('./dashboard-charts').then((m) => ({ default: m.DashboardCharts })), { ssr: false });
const DemandForecasting = dynamic(() => import('./demand-forecasting').then((m) => ({ default: m.DemandForecasting })), { ssr: false });
const KpiSummary = dynamic(() => import('./kpi-summary').then((m) => ({ default: m.KpiSummary })), { ssr: false });

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = React.useState('2025-05-01');
  const [dateTo, setDateTo] = React.useState('2026-04-30');

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Business intelligence, forecasting, and KPI tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36 text-sm"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36 text-sm"
            />
          </div>
          <Button variant="outline" onClick={handleExportPDF} className="print:hidden">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="forecasting">Demand Forecasting</TabsTrigger>
          <TabsTrigger value="kpi">KPI Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardCharts />
        </TabsContent>

        <TabsContent value="forecasting">
          <DemandForecasting />
        </TabsContent>

        <TabsContent value="kpi">
          <KpiSummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
