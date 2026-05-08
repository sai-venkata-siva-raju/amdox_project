import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  @Get()
  @ApiOperation({ summary: 'Get notification list' })
  @ApiResponse({ status: 200, description: 'Notification list returned' })
  findAll() {
    return [
      {
        id: '1',
        type: 'info',
        title: 'System Update',
        message: 'System maintenance scheduled for tonight',
        read: false,
        module: 'system',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'warning',
        title: 'Low Inventory',
        message: 'Component B stock below reorder level',
        read: true,
        module: 'inventory',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ];
  }
}
