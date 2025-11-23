import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: { page?: number; limit?: number; type?: string; search?: string }) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const type = query.type || 'all';
        const search = query.search?.toLowerCase() || '';

        // 1. Fetch Receipts (GRNs)
        const grns = await this.prisma.goods_received.findMany({
            include: {
                suppliers: true,
                goods_received_items: {
                    include: { products: true },
                },
            },
            orderBy: { received_date: 'desc' },
        });

        // 2. Fetch Adjustments
        const adjustments = await this.prisma.inventory_adjustments.findMany({
            include: {
                adjustment_items: {
                    include: { products: true },
                },
            },
            orderBy: { adjustment_date: 'desc' },
        });

        // 3. Map to Unified Transaction Format
        let transactions: any[] = [];

        // Map GRNs
        grns.forEach((grn) => {
            grn.goods_received_items.forEach((item) => {
                transactions.push({
                    id: `${grn.grn_number}-${item.id}`, // Unique ID for key
                    dateTime: grn.received_date,
                    refNo: grn.grn_number,
                    item: item.products.name,
                    type: 'Receipt',
                    qtyChange: item.quantity,
                    source: grn.suppliers.name,
                    rawType: 'receipt', // For filtering
                });
            });
        });

        // Map Adjustments
        adjustments.forEach((adj) => {
            adj.adjustment_items.forEach((item) => {
                // Determine sign based on adjustment type
                let qty = item.quantity_after - item.quantity_before;

                // If it's a count, the change is calculated.
                // If it's damage/loss, it's usually negative, but let's rely on before/after logic if available.
                // Wait, my create logic for adjustments updates stock directly.
                // Let's check how I stored it.
                // In adjustment_items, I store quantity_before and quantity_after.
                // So qtyChange = quantity_after - quantity_before.

                transactions.push({
                    id: `${adj.adjustment_number}-${item.id}`,
                    dateTime: adj.adjustment_date,
                    refNo: adj.adjustment_number,
                    item: item.products.name,
                    type: 'Adjustment',
                    qtyChange: qty,
                    source: adj.notes || this.mapAdjustmentReason(adj.adjustment_type),
                    rawType: 'adjustment',
                });
            });
        });

        // 4. Filter
        if (type !== 'all') {
            transactions = transactions.filter((t) => t.type === type);
        }

        if (search) {
            transactions = transactions.filter(
                (t) =>
                    t.refNo.toLowerCase().includes(search) ||
                    t.item.toLowerCase().includes(search) ||
                    t.source.toLowerCase().includes(search)
            );
        }

        // 5. Sort by Date Descending
        transactions.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

        // 6. Paginate
        const totalItems = transactions.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const paginatedTransactions = transactions.slice(startIndex, startIndex + limit);

        return {
            data: paginatedTransactions.map(t => ({
                ...t,
                dateTime: t.dateTime.toISOString().replace('T', ' ').substring(0, 16), // Format: YYYY-MM-DD HH:mm
            })),
            meta: {
                totalItems,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
            },
        };
    }

    private mapAdjustmentReason(type: string): string {
        const map: Record<string, string> = {
            count: 'Stock Count',
            damage: 'Damaged Goods',
            loss: 'Lost Inventory',
            other: 'Other Adjustment',
        };
        return map[type] || 'Adjustment';
    }
}
