import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PurchasingService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

    async findAll(status?: string, search?: string) {
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { pr_number: { contains: search, mode: 'insensitive' } },
                { users_purchase_requisitions_requested_byTousers: { first_name: { contains: search, mode: 'insensitive' } } },
                { users_purchase_requisitions_requested_byTousers: { last_name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const prs = await this.prisma.purchase_requisitions.findMany({
            where,
            include: {
                users_purchase_requisitions_requested_byTousers: true,
                purchase_requisition_items: {
                    include: {
                        products: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return prs.map((pr) => ({
            id: pr.pr_number,
            itemsList: pr.purchase_requisition_items.map((item) => ({
                name: item.products.name,
                sku: item.products.sku,
                qty: item.quantity,
                price: 0,
            })),
            total: 0,
            status: this.mapStatus(pr.status),
            date: pr.created_at.toISOString().split('T')[0],
            requester: `${pr.users_purchase_requisitions_requested_byTousers.first_name} ${pr.users_purchase_requisitions_requested_byTousers.last_name}`,
        }));
    }

    async findOne(id: string) {
        const pr = await this.prisma.purchase_requisitions.findUnique({
            where: { pr_number: id },
            include: {
                users_purchase_requisitions_requested_byTousers: true,
                purchase_requisition_items: {
                    include: {
                        products: true,
                    },
                },
            },
        });

        if (!pr) return null;

        return {
            id: pr.pr_number,
            itemsList: pr.purchase_requisition_items.map((item) => ({
                name: item.products.name,
                sku: item.products.sku,
                qty: item.quantity,
                price: 0,
            })),
            total: 0,
            status: this.mapStatus(pr.status),
            date: pr.created_at.toISOString().split('T')[0],
            requester: `${pr.users_purchase_requisitions_requested_byTousers.first_name} ${pr.users_purchase_requisitions_requested_byTousers.last_name}`,
        };
    }

    async create(data: any) {
        const { items, notes, userId, priority } = data;

        const result = await this.prisma.$transaction(async (tx) => {
            const pr = await tx.purchase_requisitions.create({
                data: {
                    id: `pr-${Date.now()}`,
                    pr_number: `PR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                    requested_by: userId,
                    department: 'General',
                    status: 'pending',
                    requested_date: new Date(),
                    notes: notes ? `${notes} [Priority: ${priority}]` : `[Priority: ${priority}]`,
                    updated_at: new Date(),
                },
            });

            for (const item of items) {
                await tx.purchase_requisition_items.create({
                    data: {
                        id: `pr-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        pr_id: pr.id,
                        product_id: item.productId,
                        quantity: Number(item.quantity),
                        status: 'pending',
                    },
                });
            }

            return pr;
        });

        // Send Notification (outside transaction)
        await this.notificationsService.create({
            title: 'New Purchase Requisition',
            message: `PR ${result.pr_number} created by user and is pending approval.`,
            type: 'approval',
            link: `/purchasing/requisition/${result.pr_number}`
        });

        return result;
    }

    async updateStatus(id: string, status: string) {
        return await this.prisma.purchase_requisitions.update({
            where: { pr_number: id },
            data: {
                status: status as any,
                updated_at: new Date(),
            },
        });
    }

    private mapStatus(status: string): string {
        const map: Record<string, string> = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            completed: 'Completed',
            draft: 'Draft',
        };
        return map[status] || status;
    }
}
