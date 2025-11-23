import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdjustmentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(type?: string, search?: string) {
        const where: any = {};

        // Filter by type
        if (type && type !== 'all') {
            // Map frontend type to database enum
            const typeMap: Record<string, string> = {
                'Add': 'count',
                'Remove': 'damage',
            };
            where.adjustment_type = typeMap[type] || type.toLowerCase();
        }

        // Search by adjustment number
        if (search) {
            where.adjustment_number = { contains: search, mode: 'insensitive' };
        }

        const adjustments = await this.prisma.inventory_adjustments.findMany({
            where,
            include: {
                adjustment_items: {
                    include: {
                        products: true,
                    },
                },
                users_inventory_adjustments_adjusted_byTousers: true,
            },
            orderBy: {
                adjustment_date: 'desc',
            },
        });

        return adjustments.map((adj) => {
            const firstItem = adj.adjustment_items[0];
            // Map database enum to frontend display
            const isAdd = adj.adjustment_type === 'count';
            return {
                id: adj.adjustment_number,
                date: adj.adjustment_date.toISOString().split('T')[0],
                product: firstItem?.products.name || 'N/A',
                sku: firstItem?.products.sku || 'N/A',
                type: isAdd ? 'Add' : 'Remove',
                qty: firstItem ? Math.abs(firstItem.quantity_after - firstItem.quantity_before) : 0,
                remark: firstItem?.reason || adj.notes || '',
                user: `${adj.users_inventory_adjustments_adjusted_byTousers.first_name} ${adj.users_inventory_adjustments_adjusted_byTousers.last_name}`,
            };
        });
    }

    async findOne(id: string) {
        const adj = await this.prisma.inventory_adjustments.findUnique({
            where: { adjustment_number: id },
            include: {
                adjustment_items: {
                    include: {
                        products: true,
                    },
                },
                users_inventory_adjustments_adjusted_byTousers: true,
            },
        });

        if (!adj) {
            return null;
        }

        const firstItem = adj.adjustment_items[0];
        const isAdd = adj.adjustment_type === 'count';
        return {
            id: adj.adjustment_number,
            date: adj.adjustment_date.toISOString().split('T')[0],
            product: firstItem?.products.name || 'N/A',
            sku: firstItem?.products.sku || 'N/A',
            type: isAdd ? 'Add' : 'Remove',
            qty: firstItem ? Math.abs(firstItem.quantity_after - firstItem.quantity_before) : 0,
            remark: firstItem?.reason || adj.notes || '',
            user: `${adj.users_inventory_adjustments_adjusted_byTousers.first_name} ${adj.users_inventory_adjustments_adjusted_byTousers.last_name}`,
        };
    }

    async getStats() {
        const total = await this.prisma.inventory_adjustments.count();

        // count = Add, damage/loss/other = Remove
        const addCount = await this.prisma.inventory_adjustments.count({
            where: { adjustment_type: 'count' },
        });

        const removeCount = total - addCount;

        const addRate = total > 0 ? Math.round((addCount / total) * 100) : 0;
        const removeRate = total > 0 ? Math.round((removeCount / total) * 100) : 0;

        return {
            total,
            addRate: `${addRate}%`,
            removeRate: `${removeRate}%`,
            accuracy: '98.5%', // Mock value
        };
    }
}
