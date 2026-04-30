'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth-context';
import { mockApi } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Loader as Loader2, CircleCheck as CheckCircle2, Circle, Clock, DollarSign, Users, Milestone as MilestoneIcon, TriangleAlert as AlertTriangle, Calendar, ChartBar as BarChart3, TrendingUp, UserPlus } from 'lucide-react';

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

interface Milestone {
  id: string;
  name: string;
  due_date: string;
  status: string;
  sort_order: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee_id: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  estimated_hours: number;
  milestone_id: string | null;
}

interface Member {
  id: string;
  employee_id: string;
  allocation_pct: number;
  role: string;
  employee: { first_name: string; last_name: string; department: string };
}

interface Profile {
  id: string;
  full_name: string;
}

const priorityColors: Record<string, string> = {
  Low: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  High: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800',
};

const taskStatusColors: Record<string, string> = {
  'To Do': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  'In Review': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
};

const statusConfig: Record<string, { bg: string; dot: string }> = {
  Planning: { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800', dot: 'bg-blue-500' },
  Active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' },
  'On Hold': { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
  Completed: { bg: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', dot: 'bg-slate-400' },
};

export function ProjectDetail({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const { profile } = useAuth();
  const [project, setProject] = React.useState<Project | null>(null);
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [taskForm, setTaskForm] = React.useState({
    title: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', estimated_hours: '', assignee_id: '', milestone_id: '',
  });

  const [memberForm, setMemberForm] = React.useState({
    employee_id: '', allocation_pct: '100', role: 'Member',
  });

  const fetchData = React.useCallback(async () => {
    if (!profile?.tenant_id || !projectId) return;
    setLoading(true);

    const [projRes, mileRes, taskRes, memRes, profRes] = await Promise.all([
      mockApi.getProjects().then(p => ({ data: p?.find((project: any) => project.id === projectId) })),
      mockApi.getMilestones().then(m => ({ data: m?.filter((milestone: any) => milestone.project_id === projectId) })),
      mockApi.getTasks().then(t => ({ data: t?.filter((task: any) => task.project_id === projectId) })),
      mockApi.getProjectMembers().then(m => ({ data: m?.filter((member: any) => member.project_id === projectId) })),
      mockApi.getEmployees().then(e => ({ data: e })),
    ]);

    if (projRes.data) setProject(projRes.data);
    if (mileRes.data) {
      const today = new Date().toISOString().slice(0, 10);
      setMilestones(mileRes.data.map((m: any) => ({
        ...m,
        status: m.status === 'Pending' && m.due_date < today ? 'Overdue' : m.status,
      })));
    }
    if (taskRes.data) setTasks(taskRes.data);
    if (memRes.data) setMembers(memRes.data as any);
    if (profRes.data) setProfiles(profRes.data);

    setLoading(false);
  }, [profile?.tenant_id, projectId]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddTask = async () => {
    if (!profile?.tenant_id || !taskForm.title) return;
    setSaving(true);
    // Mock insert operation
    await mockApi.insert('tasks', {
      tenant_id: profile.tenant_id,
      project_id: projectId,
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      status: taskForm.status,
      due_date: taskForm.due_date || null,
      estimated_hours: Number(taskForm.estimated_hours) || 0,
      assignee_id: taskForm.assignee_id === 'none' ? null : taskForm.assignee_id || null,
      milestone_id: taskForm.milestone_id === 'none' ? null : taskForm.milestone_id || null,
    });
    setSaving(false);
    setTaskDialogOpen(false);
    setTaskForm({ title: '', description: '', priority: 'Medium', status: 'To Do', due_date: '', estimated_hours: '', assignee_id: '', milestone_id: '' });
    fetchData();
  };

  const handleAddMember = async () => {
    if (!profile?.tenant_id || !memberForm.employee_id) return;
    setSaving(true);
    // Mock insert operation
    await mockApi.insert('project_members', {
      tenant_id: profile.tenant_id,
      project_id: projectId,
      employee_id: memberForm.employee_id,
      allocation_pct: Number(memberForm.allocation_pct),
      role: memberForm.role,
    });
    setSaving(false);
    setMemberDialogOpen(false);
    setMemberForm({ employee_id: '', allocation_pct: '100', role: 'Member' });
    fetchData();
  };

  const toggleTaskStatus = async (task: Task) => {
    const next: Record<string, string> = { 'To Do': 'In Progress', 'In Progress': 'In Review', 'In Review': 'Done', Done: 'To Do' };
    await mockApi.update('tasks', task.id, { status: next[task.status] || 'To Do' });
    fetchData();
  };

  const toggleMilestoneStatus = async (m: Milestone) => {
    const next = m.status === 'Completed' ? 'Pending' : 'Completed';
    await mockApi.update('milestones', m.id, { status: next });
    fetchData();
  };

  const updateProjectStatus = async (status: string) => {
    await mockApi.update('projects', projectId, { status });
    fetchData();
  };

  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    const p = profiles.find((p) => p.id === assigneeId);
    return p?.full_name || 'Unknown';
  };

  if (loading || !project) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse bg-muted/30 rounded" />
        {[1, 2, 3].map((i) => (
          <Card key={i}><CardContent className="h-40 animate-pulse bg-muted/30 rounded-lg" /></Card>
        ))}
      </div>
    );
  }

  const budgetPct = project.budget_planned > 0
    ? Math.min((Number(project.budget_actual) / Number(project.budget_planned)) * 100, 150)
    : 0;
  const overBudget = budgetPct > 100;
  const taskDone = tasks.filter((t) => t.status === 'Done').length;
  const taskTotal = tasks.length;
  const sc = statusConfig[project.status] || statusConfig.Planning;

  const projectStartDate = project.start_date ? new Date(project.start_date) : new Date();
  const projectDeadline = project.deadline ? new Date(project.deadline) : new Date();
  const totalDays = Math.max(Math.ceil((projectDeadline.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)), 1);
  const elapsedDays = Math.max(Math.ceil((Date.now() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)), 0);
  const timeProgress = Math.min((elapsedDays / totalDays) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold truncate">{project.name}</h2>
              <Badge className={`${sc.bg} border text-[11px] font-medium`} variant="outline">
                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={project.status} onValueChange={updateProjectStatus}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-2xl font-bold">{project.progress}%</p>
              <Progress value={project.progress} className="h-2.5 flex-1" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tasks</p>
            <p className="text-2xl font-bold mt-2">{taskDone} <span className="text-sm font-normal text-muted-foreground">/ {taskTotal} completed</span></p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${overBudget ? 'border-l-rose-500' : 'border-l-amber-500'}`}>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Budget</p>
            <p className={`text-2xl font-bold mt-2 ${overBudget ? 'text-rose-600' : ''}`}>
              ${(Number(project.budget_actual) / 1000).toFixed(0)}K
              <span className="text-sm font-normal text-muted-foreground"> / ${(Number(project.budget_planned) / 1000).toFixed(0)}K</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Team Size</p>
            <p className="text-2xl font-bold mt-2">{members.length} <span className="text-sm font-normal text-muted-foreground">members</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Timeline - Gantt Style */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MilestoneIcon className="h-4 w-4" /> Milestone Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No milestones defined</p>
          ) : (
            <div className="space-y-0">
              {/* Timeline header bar */}
              <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                <div className="w-48 shrink-0" />
                <div className="flex-1 relative h-6 bg-muted/50 rounded">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500/10 rounded-l"
                    style={{ width: `${timeProgress}%` }}
                  />
                  <div className="absolute top-0 left-0 h-full w-full flex items-center justify-between px-2">
                    <span>{project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start'}</span>
                    <span>{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End'}</span>
                  </div>
                  <div
                    className="absolute top-0 h-full w-0.5 bg-blue-500"
                    style={{ left: `${timeProgress}%` }}
                  />
                </div>
              </div>

              {/* Milestone rows */}
              {milestones.map((m, idx) => {
                const mStart = m.due_date ? new Date(m.due_date) : projectDeadline;
                const mPos = Math.max(0, Math.min(((mStart.getTime() - projectStartDate.getTime()) / (projectDeadline.getTime() - projectStartDate.getTime())) * 100, 100));
                const isCompleted = m.status === 'Completed';
                const isOverdue = m.status === 'Overdue';

                return (
                  <div key={m.id} className="flex items-center gap-2 group">
                    <div className="w-48 shrink-0 flex items-center gap-2 py-2">
                      <button
                        onClick={() => toggleMilestoneStatus(m)}
                        className="shrink-0 hover:scale-110 transition-transform"
                      >
                        {isCompleted
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          : isOverdue
                            ? <AlertTriangle className="h-4 w-4 text-rose-500" />
                            : <Circle className="h-4 w-4 text-slate-300" />}
                      </button>
                      <span className={`text-sm truncate ${isCompleted ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                        {m.name}
                      </span>
                    </div>
                    <div className="flex-1 relative h-8 bg-muted/30 rounded">
                      {/* Gantt bar */}
                      <div
                        className={`absolute top-1 h-6 rounded-md transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/20 border border-emerald-400/40'
                            : isOverdue
                              ? 'bg-rose-500/20 border border-rose-400/40'
                              : 'bg-blue-500/15 border border-blue-400/30'
                        }`}
                        style={{
                          left: `${Math.max(0, mPos - 12)}%`,
                          width: '24%',
                        }}
                      />
                      {/* Diamond marker */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rotate-45 rounded-sm ${
                          isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                        style={{ left: `${mPos}%` }}
                      />
                    </div>
                    <div className="w-24 shrink-0 text-right">
                      <Badge
                        className={isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
                          : isOverdue
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800'
                            : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}
                        variant="outline"
                      >
                        {m.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Tracker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Budget Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Planned Budget</p>
              <p className="text-xl font-bold font-mono">${Number(project.budget_planned).toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Actual Spend</p>
              <p className={`text-xl font-bold font-mono ${overBudget ? 'text-rose-600' : ''}`}>
                ${Number(project.budget_actual).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={`text-xl font-bold font-mono ${overBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${overBudget ? '0' : (Number(project.budget_planned) - Number(project.budget_actual)).toLocaleString()}
              </p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Budget Utilization</span>
              <span className={`font-mono font-semibold ${overBudget ? 'text-rose-600' : budgetPct > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {budgetPct.toFixed(0)}%
              </span>
            </div>
            <Progress
              value={Math.min(budgetPct, 100)}
              className={`h-3 ${overBudget ? '[&>div]:bg-rose-500' : budgetPct > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
            />
          </div>
          {overBudget && (
            <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Over budget by ${(Number(project.budget_actual) - Number(project.budget_planned)).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks and Team Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tasks" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Tasks ({taskTotal})
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Team ({members.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setMemberDialogOpen(true)}>
              <UserPlus className="mr-1 h-3.5 w-3.5" /> Add Member
            </Button>
            <Button size="sm" onClick={() => setTaskDialogOpen(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Task
            </Button>
          </div>
        </div>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-0">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground p-8 text-center">No tasks yet. Add a task to get started.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Task</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id} className={task.status === 'Done' ? 'opacity-50' : ''}>
                        <TableCell>
                          <button onClick={() => toggleTaskStatus(task)} className="hover:scale-110 transition-transform">
                            {task.status === 'Done'
                              ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              : <Circle className="h-4 w-4 text-slate-300" />}
                          </button>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${task.status === 'Done' ? 'line-through' : ''}`}>
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-56 mt-0.5">{task.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{getAssigneeName(task.assignee_id)}</TableCell>
                        <TableCell>
                          <Badge className={priorityColors[task.priority] || ''} variant="outline">
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={taskStatusColors[task.status] || ''} variant="outline">
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {task.due_date
                            ? <span className={task.due_date < new Date().toISOString().slice(0, 10) && task.status !== 'Done' ? 'text-rose-600 font-semibold' : ''}>
                                <Calendar className="h-3 w-3 inline mr-1 text-muted-foreground" />
                                {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {Number(task.estimated_hours) > 0 ? `${task.estimated_hours}h` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardContent className="p-6">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No team members assigned</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {members.map((m) => {
                    const emp = m.employee as any;
                    const initials = emp ? `${emp.first_name[0]}${emp.last_name[0]}` : '?';
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{m.role}</Badge>
                            <span className="text-xs text-muted-foreground">{m.allocation_pct}%</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{emp?.department || '-'}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Create a new task for this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Design login page" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional details" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={taskForm.status} onValueChange={(v) => setTaskForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={taskForm.assignee_id} onValueChange={(v) => setTaskForm((f) => ({ ...f, assignee_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Milestone</Label>
                <Select value={taskForm.milestone_id} onValueChange={(v) => setTaskForm((f) => ({ ...f, milestone_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {milestones.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm((f) => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Estimated Hours</Label>
                <Input type="number" value={taskForm.estimated_hours} onChange={(e) => setTaskForm((f) => ({ ...f, estimated_hours: e.target.value }))} placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={saving || !taskForm.title}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Assign an employee to this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={memberForm.employee_id} onValueChange={(v) => setMemberForm((f) => ({ ...f, employee_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => {
                    const emp = m.employee as any;
                    return (
                      <SelectItem key={m.employee_id} value={m.employee_id}>
                        {emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={memberForm.role} onValueChange={(v) => setMemberForm((f) => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Reviewer">Reviewer</SelectItem>
                    <SelectItem value="Observer">Observer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Allocation %</Label>
                <Input type="number" min="0" max="100" value={memberForm.allocation_pct} onChange={(e) => setMemberForm((f) => ({ ...f, allocation_pct: e.target.value }))} placeholder="100" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={saving || !memberForm.employee_id}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
