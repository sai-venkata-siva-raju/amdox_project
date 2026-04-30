'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PurchaseOrders } from './purchase-orders';
import { Inventory } from './inventory';
import { VendorManagement } from './vendors';

export default function SupplyChainPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Supply Chain</h1>
        <p className="text-sm text-muted-foreground">
          Purchase orders, inventory management, and vendor relationships
        </p>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Inventory />
        </TabsContent>

        <TabsContent value="pos">
          <PurchaseOrders />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
