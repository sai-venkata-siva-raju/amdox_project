'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { mockApi, mockEmployees, mockAccountsPayable, mockAccountsReceivable, mockPurchaseOrders, mockProjects } from '@/lib/mock-data';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search, DollarSign, Users, Truck, FolderKanban, Loader as Loader2,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: string;
  label: string;
  description: string;
  href: string;
  module: string;
}

const moduleIcons: Record<string, React.ElementType> = {
  Finance: DollarSign,
  HR: Users,
  'Supply Chain': Truck,
  Projects: FolderKanban,
};

const moduleColors: Record<string, string> = {
  Finance: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
  HR: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
  'Supply Chain': 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
  Projects: 'bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400',
};

export function GlobalSearch({ externalOpen, onExternalOpenChange }: { externalOpen?: boolean; onExternalOpenChange?: (open: boolean) => void } = {}) {
  const { profile } = useAuth();
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onExternalOpenChange || setInternalOpen;
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Ctrl+K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset on open/close
  React.useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  React.useEffect(() => {
    if (!query.trim() || !profile?.tenant_id) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();
      const searchResults: SearchResult[] = [];

      const [empRes, apRes, arRes, poRes, projRes] = await Promise.all([
        mockApi.getEmployees(),
        mockApi.getAccountsPayable(),
        mockApi.getAccountsReceivable(),
        mockApi.getPurchaseOrders(),
        mockApi.getProjects(),
      ]);

      if (empRes.data) {
        empRes.data.forEach((e: any) => {
          searchResults.push({
            id: e.id, type: 'Employee', label: `${e.first_name} ${e.last_name}`,
            description: e.department, href: '/hr-payroll', module: 'HR',
          });
        });
      }
      if (apRes.data) {
        apRes.data.forEach((i: any) => {
          searchResults.push({
            id: i.id, type: 'AP Invoice', label: i.invoice_number,
            description: `${i.vendor_name} - $${Number(i.amount).toLocaleString()}`, href: '/finance', module: 'Finance',
          });
        });
      }
      if (arRes.data) {
        arRes.data.forEach((i: any) => {
          searchResults.push({
            id: i.id, type: 'AR Invoice', label: i.invoice_number,
            description: `${i.customer_name} - $${Number(i.amount).toLocaleString()}`, href: '/finance', module: 'Finance',
          });
        });
      }
      if (poRes.data) {
        poRes.data.forEach((p: any) => {
          searchResults.push({
            id: p.id, type: 'Purchase Order', label: p.po_number,
            description: `$${Number(p.total_amount).toLocaleString()}`, href: '/supply-chain', module: 'Supply Chain',
          });
        });
      }
      if (projRes.data) {
        projRes.data.forEach((p: any) => {
          searchResults.push({
            id: p.id, type: 'Project', label: p.name,
            description: `Status: ${p.status}`, href: '/projects', module: 'Projects',
          });
        });
      }

      setResults(searchResults);
      setSelectedIndex(0);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, profile?.tenant_id]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      setOpen(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
  };

  // Group results by module
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.module]) acc[r.module] = [];
    acc[r.module].push(r);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search employees, invoices, projects..."
            className="border-0 focus-visible:ring-0 h-11 text-sm"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {results.length > 0 ? (
          <div className="max-h-80 overflow-y-auto py-2">
            {Object.entries(grouped).map(([module, items]) => {
              const Icon = moduleIcons[module] || Search;
              const color = moduleColors[module] || 'bg-slate-50 text-slate-600';
              return (
                <div key={module}>
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{module}</span>
                    <Badge variant="secondary" className="text-[10px] ml-auto">{items.length}</Badge>
                  </div>
                  {items.map((item, idx) => {
                    const globalIdx = results.indexOf(item);
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          globalIdx === selectedIndex ? 'bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{item.type}</Badge>
                      </button>
                    );
                  })}
                  <Separator className="my-1" />
                </div>
              );
            })}
          </div>
        ) : query.trim() && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No results for &quot;{query}&quot;</p>
          </div>
        ) : !query.trim() ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Start typing to search</p>
            <p className="text-xs mt-1">Search across employees, invoices, POs, and projects</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
