import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        userId?: string;
        title: string;
        message: string;
        type: string;
        link?: string;
    }) {
        return this.prisma.notifications.create({
            data: {
                id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                user_id: data.userId,
                title: data.title,
                message: data.message,
                type: data.type,
                link: data.link,
                is_read: false,
                created_at: new Date(),
            }
        });
    }

    async findAll(userId: string) {
        return this.prisma.notifications.findMany({
            where: {
                OR: [
                    { user_id: userId },
                    { user_id: null } // System-wide notifications
                ]
            },
            orderBy: { created_at: 'desc' },
            take: 50 // Limit to last 50
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notifications.update({
            where: { id },
            data: { is_read: true }
        });
    }

    async markAllAsRead(userId: string) {
        // This is tricky because system-wide notifications (user_id: null) are shared.
        // For simplicity, we only mark user-specific notifications as read, 
        // or we need a separate table for read status of system notifications.
        // For now, let's assume we only update notifications assigned to the user.
        // Or we can update all notifications that match the user query.

        return this.prisma.notifications.updateMany({
            where: {
                user_id: userId,
                is_read: false
            },
            data: { is_read: true }
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notifications.count({
            where: {
                OR: [
                    { user_id: userId },
                    { user_id: null }
                ],
                is_read: false
            }
        });
    }
}
