import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        // 1. Total Items (SKUs)
        const totalItems = await this.prisma.products.count();

        // 2. Low Stock Items
        // Prisma doesn't support direct field comparison in where clause easily without raw query or filtering in JS for simple cases
        // But we can fetch items with inventory levels and filter
        const products = await this.prisma.products.findMany({
            include: {
                inventory_levels: true,
            },
        });

        const lowStockCount = products.filter((p) => {
            const qty = p.inventory_levels?.quantity || 0;
            return qty <= (p.minimum_stock || 0);
        }).length;

        // 3. Pending Orders (Purchase Requisitions)
        const pendingOrders = await this.prisma.purchase_requisitions.count({
            where: { status: 'pending' },
        });

        // 4. Inventory Value (Estimated)
        // Get latest price for each product from GRN items
        // This is expensive, for now let's do a simplified version or just sum quantities
        // Real implementation would need a 'cost_price' on product or weighted average logic
        let totalValue = 0;
        for (const p of products) {
            const qty = p.inventory_levels?.quantity || 0;
            if (qty > 0) {
                // Find last GRN price
                const lastGrnItem = await this.prisma.goods_received_items.findFirst({
                    where: { product_id: p.id },
                    orderBy: { goods_received: { received_date: 'desc' } },
                    select: { unit_price: true }
                });
                const price = lastGrnItem?.unit_price ? Number(lastGrnItem.unit_price) : 0;
                totalValue += qty * price;
            }
        }

        return {
            totalItems,
            lowStockCount,
            pendingOrders,
            totalValue,
        };
    }

    async getRecentTransactions() {
        // Fetch recent GRNs, Shipments, Adjustments and merge/sort
        const [grns, shipments, adjustments] = await Promise.all([
            this.prisma.goods_received.findMany({
                take: 5,
                orderBy: { received_date: 'desc' },
                include: { suppliers: true },
            }),
            this.prisma.sales_shipments.findMany({
                take: 5,
                orderBy: { shipment_date: 'desc' },
            }),
            this.prisma.inventory_adjustments.findMany({
                take: 5,
                orderBy: { adjustment_date: 'desc' },
            }),
        ]);

        const transactions = [
            ...grns.map(g => ({
                id: g.grn_number,
                type: 'receipt',
                description: `Received from ${g.suppliers.name}`,
                amount: `฿${Number(g.total_amount).toLocaleString()}`,
                date: g.received_date,
                status: g.status,
            })),
            ...shipments.map(s => ({
                id: s.shipment_number,
                type: 'shipment',
                description: `Shipped to ${s.customer_name}`,
                amount: '-', // Shipments might not have total amount easily accessible without items
                date: s.shipment_date || s.created_at,
                status: s.status,
            })),
            ...adjustments.map(a => ({
                id: a.adjustment_number,
                type: 'adjustment',
                description: `Adjustment (${a.adjustment_type})`,
                amount: '-', // Adjustments don't have monetary value directly
                date: a.adjustment_date,
                status: a.status,
            })),
        ];

        // Sort by date desc and take top 5
        return transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }

    async getLowStockItems() {
        const products = await this.prisma.products.findMany({
            include: {
                inventory_levels: true,
                categories: true, // Assuming supplier info might be elsewhere or just use category for now
            },
        });

        return products
            .filter((p) => {
                const qty = p.inventory_levels?.quantity || 0;
                return qty <= (p.minimum_stock || 0);
            })
            .map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                quantity: p.inventory_levels?.quantity || 0,
                minLevel: p.minimum_stock,
                supplier: 'N/A', // Supplier is not directly linked to product in schema, usually via GRN history or separate relation
            }))
            .slice(0, 10);
    }
}
