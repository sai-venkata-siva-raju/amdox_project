'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeManagement } from './employees';
import { LeaveManagement } from './leave-management';
import { Payroll } from './payroll';

export default function HRPayrollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">HR & Payroll</h1>
        <p className="text-sm text-muted-foreground">
          Employee management, leave tracking, and payroll processing
        </p>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="leave">Leave Management</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveManagement />
        </TabsContent>

        <TabsContent value="payroll">
          <Payroll />
        </TabsContent>
      </Tabs>
    </div>
  );
}
