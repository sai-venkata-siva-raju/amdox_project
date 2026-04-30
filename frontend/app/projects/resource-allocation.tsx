'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { TriangleAlert as AlertTriangle, Users, Loader as Loader2, TrendingUp, UserCheck, ChartBar as BarChart3 } from 'lucide-react';

interface AllocationRow {
  employee_id: string;
  employee_name: string;
  department: string;
  allocations: { project_name: string; allocation_pct: number; role: string }[];
  total_pct: number;
  overallocated: boolean;
}

export function ResourceAllocation() {
  const { profile } = useAuth();
  const [allocations, setAllocations] = React.useState<AllocationRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!profile?.tenant_id) return;

    const fetchAllocations = async () => {
      const [memRes, empRes] = await Promise.all([
        supabase.from('project_members').select('employee_id, allocation_pct, role, project_id, projects!project_members_project_id_fkey(name)').eq('tenant_id', profile.tenant_id),
        supabase.from('employees').select('id, first_name, last_name, department').eq('tenant_id', profile.tenant_id),
      ]);

      if (memRes.data && empRes.data) {
        const empMap: Record<string, { name: string; department: string }> = {};
        empRes.data.forEach((e: any) => {
          empMap[e.id] = { name: `${e.first_name} ${e.last_name}`, department: e.department };
        });

        const allocMap: Record<string, AllocationRow> = {};
        memRes.data.forEach((m: any) => {
          const proj = m.projects as any;
          const emp = empMap[m.employee_id];
          if (!emp) return;

          if (!allocMap[m.employee_id]) {
            allocMap[m.employee_id] = {
              employee_id: m.employee_id,
              employee_name: emp.name,
              department: emp.department,
              allocations: [],
              total_pct: 0,
              overallocated: false,
            };
          }

          allocMap[m.employee_id].allocations.push({
            project_name: proj?.name || 'Unknown',
            allocation_pct: m.allocation_pct,
            role: m.role,
          });
          allocMap[m.employee_id].total_pct += m.allocation_pct;
          allocMap[m.employee_id].overallocated = allocMap[m.employee_id].total_pct > 100;
        });

        const sorted = Object.values(allocMap).sort((a, b) => b.total_pct - a.total_pct);
        setAllocations(sorted);
      }

      setLoading(false);
    };

    fetchAllocations();
  }, [profile?.tenant_id]);

  const overallocatedCount = allocations.filter((a) => a.overallocated).length;
  const avgUtilization = allocations.length > 0
    ? Math.round(allocations.reduce((s, a) => s + a.total_pct, 0) / allocations.length)
    : 0;
  const fullyAllocated = allocations.filter((a) => a.total_pct >= 80 && !a.overallocated).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="h-20 animate-pulse bg-muted/30 rounded-lg" /></Card>
          ))}
        </div>
        <Card><CardContent className="h-64 animate-pulse bg-muted/30 rounded-lg" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Allocated</p>
              <p className="text-2xl font-bold">{allocations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Utilization</p>
              <p className="text-2xl font-bold">{avgUtilization}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">High Utilization (80%+)</p>
              <p className="text-2xl font-bold">{fullyAllocated}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${overallocatedCount > 0 ? 'border-l-rose-500' : 'border-l-slate-300'}`}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${overallocatedCount > 0 ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
              <AlertTriangle className={`h-5 w-5 ${overallocatedCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overallocated</p>
              <p className={`text-2xl font-bold ${overallocatedCount > 0 ? 'text-rose-600' : ''}`}>{overallocatedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overallocation Alert */}
      {overallocatedCount > 0 && (
        <Alert className="border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <AlertDescription className="text-rose-800 dark:text-rose-200">
            <span className="font-semibold">{overallocatedCount} employee{overallocatedCount > 1 ? 's' : ''}</span>{' '}
            {overallocatedCount > 1 ? 'are' : 'is'} overallocated (total allocation exceeds 100%).
            Review assignments to prevent burnout and scheduling conflicts.
          </AlertDescription>
        </Alert>
      )}

      {/* Utilization Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" /> Employee Utilization
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Project Assignments</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="w-44">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((a) => {
                const initials = a.employee_name.split(' ').map((n) => n[0]).join('');
                return (
                  <TableRow key={a.employee_id} className={a.overallocated ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{a.employee_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.department}</TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        {a.allocations.map((al, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className="font-medium truncate max-w-44">{al.project_name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{al.role}</Badge>
                            <span className={`font-mono ${al.allocation_pct >= 80 ? 'text-amber-600 font-semibold' : 'text-muted-foreground'}`}>
                              {al.allocation_pct}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`font-mono font-bold text-sm ${a.overallocated ? 'text-rose-600' : a.total_pct >= 80 ? 'text-amber-600' : ''}`}>
                        {a.total_pct}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <Progress
                          value={Math.min(a.total_pct, 100)}
                          className={`h-2.5 ${a.overallocated ? '[&>div]:bg-rose-500' : a.total_pct >= 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`}
                        />
                        {a.overallocated && (
                          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-semibold">
                            <AlertTriangle className="h-3 w-3" />
                            Over by {a.total_pct - 100}%
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {allocations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No resource allocations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
