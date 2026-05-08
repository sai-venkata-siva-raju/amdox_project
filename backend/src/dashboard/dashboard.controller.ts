import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary metrics and activity feed' })
  @ApiResponse({ status: 200, description: 'Dashboard summary returned' })
  getSummary() {
    return {
      kpis: [
        {
          id: '1',
          metric_key: 'total_revenue',
          metric_value: 4500000,
          label: 'Total Revenue',
        },
        {
          id: '2',
          metric_key: 'active_employees',
          metric_value: 124,
          label: 'Active Employees',
        },
        {
          id: '3',
          metric_key: 'open_purchase_orders',
          metric_value: 18,
          label: 'Open Purchase Orders',
        },
        {
          id: '4',
          metric_key: 'pending_approvals',
          metric_value: 7,
          label: 'Pending Approvals',
        },
      ],
      activities: [
        {
          id: '1',
          action: 'created',
          module: 'purchase_order',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          action: 'updated',
          module: 'inventory',
          created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: '3',
          action: 'approved',
          module: 'finance',
          created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
      ],
    };
  }
}
