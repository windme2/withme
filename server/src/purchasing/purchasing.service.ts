import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
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
                suppliers: true,
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

        return prs.map((pr) => {
            const itemsList = pr.purchase_requisition_items.map((item) => ({
                productId: item.product_id,
                name: item.products.name,
                sku: item.products.sku,
                qty: item.quantity,
                price: item.estimated_unit_price ? Number(item.estimated_unit_price) : 0,
            }));
            const total = itemsList.reduce((sum, item) => sum + (item.qty * item.price), 0);
            
            return {
                id: pr.pr_number,
                itemsList,
                total,
                status: this.mapStatus(pr.status),
                date: pr.created_at.toISOString().split('T')[0],
                requester: `${pr.users_purchase_requisitions_requested_byTousers.first_name} ${pr.users_purchase_requisitions_requested_byTousers.last_name}`,
                supplierId: pr.supplier_id || null,
                supplierName: pr.suppliers ? pr.suppliers.name : null,
            };
        });
    }

    async findOne(id: string) {
        const pr = await this.prisma.purchase_requisitions.findUnique({
            where: { pr_number: id },
            include: {
                users_purchase_requisitions_requested_byTousers: true,
                suppliers: true,
                purchase_requisition_items: {
                    include: {
                        products: true,
                    },
                },
            },
        });

        if (!pr) return null;

        const itemsList = pr.purchase_requisition_items.map((item) => ({
            productId: item.product_id,
            name: item.products.name,
            sku: item.products.sku,
            qty: item.quantity,
            price: item.estimated_unit_price ? Number(item.estimated_unit_price) : 0,
        }));
        const total = itemsList.reduce((sum, item) => sum + (item.qty * item.price), 0);

        return {
            id: pr.pr_number,
            itemsList,
            total,
            status: this.mapStatus(pr.status),
            date: pr.created_at.toISOString().split('T')[0],
            requester: `${pr.users_purchase_requisitions_requested_byTousers.first_name} ${pr.users_purchase_requisitions_requested_byTousers.last_name}`,
            supplierId: pr.supplier_id || null,
            supplierName: pr.suppliers ? pr.suppliers.name : null,
        };
    }

    async create(data: any) {
        const { items, notes, userId, priority, supplierId } = data;

        const result = await this.prisma.$transaction(async (tx) => {
            const pr = await tx.purchase_requisitions.create({
                data: {
                    id: `pr-${Date.now()}`,
                    pr_number: `PR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                    requested_by: userId,
                    supplier_id: supplierId || null,
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
                        estimated_unit_price: item.unitPrice ? Number(item.unitPrice) : null,
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
            link: `/purchasing/requisition`
        });

        return result;
    }

    async updateStatus(id: string, status: string, approverId?: string, supplierId?: string) {
        const data: any = {
            status: status as any,
            updated_at: new Date(),
        };

        if (status === 'approved') {
            // Approver must be provided and must be an admin
            if (!approverId) {
                throw new BadRequestException('approverId is required to approve a PR');
            }

            const user = await this.prisma.users.findUnique({ where: { id: approverId } });
            if (!user || user.role !== 'admin') {
                throw new ForbiddenException('Only admin users can approve purchase requisitions');
            }

            data.approved_by = approverId;
            data.approved_date = new Date();
            if (supplierId) {
                data.supplier_id = supplierId;
            }
        }

        return await this.prisma.purchase_requisitions.update({
            where: { pr_number: id },
            data,
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
