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

    private mapStatus(status: string): string {
        const statusMap: Record<string, string> = {
            pending: 'Pending',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return statusMap[status] || status;
    }
}
