import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoodsReceivedService {
    constructor(private prisma: PrismaService) { }

    async findAll(status?: string, search?: string) {
        const where: any = {};

        // Filter by status
        if (status && status !== 'all') {
            where.status = status;
        }

        // Search by GRN number or supplier
        if (search) {
            where.OR = [
                { grn_number: { contains: search, mode: 'insensitive' } },
                { suppliers: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const goodsReceived = await this.prisma.goods_received.findMany({
            where,
            include: {
                suppliers: true,
                users: true,
                goods_received_items: {
                    include: {
                        products: true,
                    },
                },
            },
            orderBy: {
                received_date: 'desc',
            },
        });

        return goodsReceived.map((grn) => ({
            id: grn.grn_number,
            poRef: `PO-${grn.grn_number.replace('GRN-', '')}`,
            supplier: grn.suppliers.name,
            date: grn.received_date.toISOString().split('T')[0],
            totalItems: grn.goods_received_items.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: Number(grn.total_amount),
            status: this.mapStatus(grn.status),
            receivedBy: `${grn.users.first_name} ${grn.users.last_name}`,
            details: grn.goods_received_items.map((item) => ({
                name: item.products.name,
                qty: item.quantity,
                price: Number(item.unit_price),
                unit: item.products.unit,
            })),
        }));
    }

    async findOne(id: string) {
        const grn = await this.prisma.goods_received.findUnique({
            where: { grn_number: id },
            include: {
                suppliers: true,
                users: true,
                goods_received_items: {
                    include: {
                        products: true,
                    },
                },
            },
        });

        if (!grn) {
            return null;
        }

        return {
            id: grn.grn_number,
            poRef: `PO-${grn.grn_number.replace('GRN-', '')}`,
            supplier: grn.suppliers.name,
            date: grn.received_date.toISOString().split('T')[0],
            totalItems: grn.goods_received_items.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: Number(grn.total_amount),
            status: this.mapStatus(grn.status),
            receivedBy: `${grn.users.first_name} ${grn.users.last_name}`,
            details: grn.goods_received_items.map((item) => ({
                name: item.products.name,
                qty: item.quantity,
                price: Number(item.unit_price),
                unit: item.products.unit,
            })),
        };
    }

    async getStats() {
        const total = await this.prisma.goods_received.count();
        const pending = await this.prisma.goods_received.count({
            where: { status: 'pending' },
        });

        // Get this month's count
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = await this.prisma.goods_received.count({
            where: {
                received_date: {
                    gte: firstDayOfMonth,
                },
            },
        });

        // Get total value
        const result = await this.prisma.goods_received.aggregate({
            _sum: {
                total_amount: true,
            },
        });

        return {
            total,
            thisMonth,
            pending,
            totalValue: Number(result._sum.total_amount || 0),
        };
    }

    async create(data: any) {
        const { supplierId, date, poRef, notes, items, userId } = data;

        return this.prisma.$transaction(async (tx) => {
            // 1. Create GRN Header
            const grn = await tx.goods_received.create({
                data: {
                    id: `grn-${Date.now()}`,
                    grn_number: `GRN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                    supplier_id: supplierId,
                    received_date: new Date(date),
                    received_by: userId,
                    status: 'completed', // Auto-complete for now to update stock immediately
                    total_amount: items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
                    notes: notes,
                    updated_at: new Date(),
                },
            });

            // 2. Process Items
            for (const item of items) {
                // Create GRN Item
                await tx.goods_received_items.create({
                    data: {
                        id: `grn-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        grn_id: grn.id,
                        product_id: item.productId,
                        quantity: Number(item.quantity),
                        unit_price: Number(item.unitPrice),
                        total_price: Number(item.quantity) * Number(item.unitPrice),
                    },
                });

                // Update Inventory Level (Increase stock)
                const currentStock = await tx.inventory_levels.findUnique({
                    where: { product_id: item.productId },
                });

                const quantityBefore = currentStock?.quantity || 0;
                const quantityAfter = quantityBefore + Number(item.quantity);

                await tx.inventory_levels.upsert({
                    where: { product_id: item.productId },
                    update: {
                        quantity: quantityAfter,
                        last_counted_at: new Date(), // Or maybe keep old count date? Let's update it.
                        updated_at: new Date(),
                    },
                    create: {
                        product_id: item.productId,
                        quantity: quantityAfter,
                        last_counted_at: new Date(),
                        last_counted_by: userId,
                        updated_at: new Date(),
                    },
                });
            }

            return grn;
        });
    }

    async createWithNotification(data: any, notificationsService: any) {
        const grn = await this.create(data);
        
        // Send notification
        await notificationsService.create({
            title: 'New Goods Received',
            message: `GRN ${grn.grn_number} received successfully`,
            type: 'info',
            link: '/inventory/goods-received'
        });
        
        return grn;
    }

    private mapStatus(status: string): string {
        const statusMap: Record<string, string> = {
            pending: 'Pending',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return statusMap[status] || status;
    }
}
