import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    // TODO: Use AuthGuard to get actual user ID
    private readonly currentUserId = 'user-admin-001';

    @Get()
    findAll() {
        return this.notificationsService.findAll(this.currentUserId);
    }

    @Get('unread-count')
    getUnreadCount() {
        return this.notificationsService.getUnreadCount(this.currentUserId);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Patch('read-all')
    markAllAsRead() {
        return this.notificationsService.markAllAsRead(this.currentUserId);
    }

    // Endpoint for testing/creating notifications manually
    @Post()
    create(@Body() data: any) {
        return this.notificationsService.create({
            ...data,
            userId: data.userId || this.currentUserId
        });
    }
}
