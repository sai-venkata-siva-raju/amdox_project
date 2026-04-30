'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Plus, Search, Loader as Loader2, Calendar, DollarSign, FolderKanban, Clock,
  TrendingUp, ArrowUpRight,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  deadline: string;
  budget_planned: number;
  budget_actual: number;
  progress: number;
}

const statusConfig: Record<string, { bg: string; dot: string }> = {
  Planning: { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800', dot: 'bg-blue-500' },
  Active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' },
  'On Hold': { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
  Completed: { bg: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', dot: 'bg-slate-400' },
};

const progressColor = (pct: number) => {
  if (pct >= 75) return '[&>div]:bg-emerald-500';
  if (pct >= 40) return '[&>div]:bg-blue-500';
  if (pct > 0) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-slate-300';
};

export function ProjectsList({ onSelect }: { onSelect: (id: string) => void }) {
  const { profile } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    name: '', description: '', status: 'Planning', start_date: '', deadline: '', budget_planned: '',
  });

  const fetchProjects = React.useCallback(async () => {
    if (!profile?.tenant_id) return;
    // Use mock data instead of supabase
    const { data } = await mockApi.getProjects();
    if (data) setProjects(data);
    setLoading(false);
  }, [profile?.tenant_id]);

  React.useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'Active').length,
    planning: projects.filter((p) => p.status === 'Planning').length,
    completed: projects.filter((p) => p.status === 'Completed').length,
  };

  const totalBudget = projects.reduce((s, p) => s + Number(p.budget_planned), 0);
  const totalSpent = projects.reduce((s, p) => s + Number(p.budget_actual), 0);

  const handleSave = async () => {
    if (!profile?.tenant_id || !form.name) return;
    setSaving(true);
    // Mock insert operation
    await mockApi.insert('projects', {
      tenant_id: profile.tenant_id,
      name: form.name,
      description: form.description,
      status: 'Planning',
      start_date: form.start_date,
      end_date: form.deadline,
      budget: Number(form.budget_planned),
      created_by: profile.id,
    });
    setSaving(false);
    setDialogOpen(false);
    setForm({ name: '', description: '', status: 'Planning', start_date: '', deadline: '', budget_planned: '' });
    fetchProjects();
  };

  const daysUntil = (dateStr: string) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-20 animate-pulse bg-muted/30 rounded-lg" /></Card>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}><CardContent className="h-56 animate-pulse bg-muted/30 rounded-lg" /></Card>
          ))}
        </div>
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
              <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Projects</p>
              <p className="text-2xl font-bold">{counts.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold">{counts.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Planning</p>
              <p className="text-2xl font-bold">{counts.planning}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
              <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget Used</p>
              <p className="text-2xl font-bold">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Project Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => {
          const daysLeft = daysUntil(project.deadline);
          const budgetPct = project.budget_planned > 0
            ? Math.min((Number(project.budget_actual) / Number(project.budget_planned)) * 100, 150)
            : 0;
          const overBudget = budgetPct > 100;
          const sc = statusConfig[project.status] || statusConfig.Planning;

          return (
            <Card
              key={project.id}
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-0.5"
              onClick={() => onSelect(project.id)}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{project.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{project.description}</p>
                  </div>
                  <Badge className={`${sc.bg} border text-[11px] font-medium shrink-0`} variant="outline">
                    <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-semibold">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className={`h-2 ${progressColor(project.progress)}`} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Deadline</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={
                        daysLeft !== null && daysLeft < 14 && daysLeft > 0
                          ? 'text-amber-600 font-semibold'
                          : daysLeft !== null && daysLeft <= 0 && project.status !== 'Completed'
                            ? 'text-rose-600 font-semibold'
                            : 'font-medium'
                      }>
                        {project.deadline
                          ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Budget</p>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={overBudget ? 'text-rose-600 font-semibold' : 'font-medium'}>
                        ${(Number(project.budget_actual) / 1000).toFixed(0)}K
                      </span>
                      <span className="text-muted-foreground">/ ${(Number(project.budget_planned) / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>

                {daysLeft !== null && daysLeft <= 0 && project.status !== 'Completed' && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/20 -mx-5 -mb-5 px-5 py-2.5 rounded-b-lg">
                    <Clock className="h-3.5 w-3.5" /> Overdue by {Math.abs(daysLeft)} days
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FolderKanban className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm font-medium">No projects found</p>
          <p className="text-xs mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Set up a new project with budget and timeline details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Platform Redesign" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Brief project description" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget ($)</Label>
                <Input type="number" value={form.budget_planned} onChange={(e) => setForm((f) => ({ ...f, budget_planned: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
