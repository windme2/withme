import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdjustmentsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

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
    async create(data: any) {
        const { type, date, notes, items, userId } = data;

        // Map frontend type to backend enum
        const typeMap: Record<string, any> = {
            'Add': 'count',
            'Remove': 'damage', // Default to damage for remove, could be loss/other
        };
        const adjustmentType = typeMap[type] || 'other';

        const result = await this.prisma.$transaction(async (tx) => {
            // 1. Create Adjustment Header
            const adjustment = await tx.inventory_adjustments.create({
                data: {
                    id: `adj-${Date.now()}`,
                    adjustment_number: `ADJ-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                    adjustment_type: adjustmentType,
                    status: 'approved', // Auto-approve for now
                    adjustment_date: new Date(date),
                    notes: notes,
                    adjusted_by: userId,
                    approved_by: userId,
                    updated_at: new Date(),
                },
            });

            const lowStockAlerts: any[] = [];

            // 2. Process Items
            for (const item of items) {
                // Get current stock
                const currentStock = await tx.inventory_levels.findUnique({
                    where: { product_id: item.productId },
                    include: { products: true }
                });

                const quantityBefore = currentStock?.quantity || 0;
                let quantityAfter = quantityBefore;

                if (type === 'Add') {
                    quantityAfter += Number(item.quantity);
                } else {
                    quantityAfter -= Number(item.quantity);
                }

                // Create Adjustment Item
                await tx.adjustment_items.create({
                    data: {
                        id: `adj-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        adjustment_id: adjustment.id,
                        product_id: item.productId,
                        quantity_before: quantityBefore,
                        quantity_after: quantityAfter,
                        reason: item.reason,
                    },
                });

                // Update Inventory Level
                await tx.inventory_levels.upsert({
                    where: { product_id: item.productId },
                    update: {
                        quantity: quantityAfter,
                        last_counted_at: new Date(),
                        last_counted_by: userId,
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

                // Check for Low Stock
                if (currentStock && currentStock.products) {
                    const product = currentStock.products;
                    if (quantityAfter <= product.minimum_stock) {
                        lowStockAlerts.push({
                            productName: product.name,
                            sku: product.sku,
                            quantity: quantityAfter,
                            minStock: product.minimum_stock
                        });
                    }
                }
            }

            return { adjustment, lowStockAlerts };
        });

        // Send Notifications (outside transaction)
        // Main notification for adjustment
        await this.notificationsService.create({
            title: 'Inventory Adjustment',
            message: `Adjustment ${result.adjustment.adjustment_number} has been ${type === 'Add' ? 'added' : 'removed'}`,
            type: 'info',
            link: '/inventory/adjustments'
        });

        // Low stock alerts
        if (result.lowStockAlerts && result.lowStockAlerts.length > 0) {
            for (const alert of result.lowStockAlerts) {
                await this.notificationsService.create({
                    title: 'Low Stock Alert',
                    message: `Product ${alert.productName} (${alert.sku}) is low on stock. Current: ${alert.quantity}, Min: ${alert.minStock}`,
                    type: 'warning',
                    link: '/inventory/items'
                });
            }
        }

        return result.adjustment;
    }
}
