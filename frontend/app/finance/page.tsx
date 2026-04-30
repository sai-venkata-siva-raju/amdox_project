'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartOfAccounts } from './chart-of-accounts';
import { JournalEntries } from './journal-entries';
import { AccountsPayable } from './accounts-payable';
import { AccountsReceivable } from './accounts-receivable';

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
        <p className="text-sm text-muted-foreground">
          General ledger, accounts payable, and accounts receivable management
        </p>
      </div>

      <Tabs defaultValue="gl" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gl">General Ledger</TabsTrigger>
          <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
          <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
        </TabsList>

        <TabsContent value="gl" className="space-y-6">
          <Tabs defaultValue="coa" className="space-y-6">
            <TabsList>
              <TabsTrigger value="coa">Chart of Accounts</TabsTrigger>
              <TabsTrigger value="je">Journal Entries</TabsTrigger>
            </TabsList>
            <TabsContent value="coa">
              <ChartOfAccounts />
            </TabsContent>
            <TabsContent value="je">
              <JournalEntries />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="ap">
          <AccountsPayable />
        </TabsContent>

        <TabsContent value="ar">
          <AccountsReceivable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
