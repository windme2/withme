import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchaseOrdersService {
    constructor(private prisma: PrismaService) { }

    async findAll(status?: string, search?: string) {
        const where: any = {};
        if (status && status !== 'all') {
            // Map frontend status (Capitalized) to backend enum (lowercase) if needed, 
            // or assume frontend sends lowercase. 
            // Actually frontend sends what we return in mapStatus? No, filter is usually manual.
            // Let's assume frontend sends lowercase or we convert.
            where.status = status.toLowerCase().replace(' ', '_');
        }
        if (search) {
            where.OR = [
                { po_number: { contains: search, mode: 'insensitive' } },
                { suppliers: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        const pos = await this.prisma.purchase_orders.findMany({
            where,
            include: { suppliers: true, purchase_order_items: true },
            orderBy: { created_at: 'desc' }
        });

        return pos.map(po => ({
            id: po.po_number,
            supplier: po.suppliers.name,
            date: po.order_date.toISOString().split('T')[0],
            amount: Number(po.total_amount),
            status: this.mapStatus(po.status),
            prRef: po.pr_number || '-',
        }));
    }

    async findOne(id: string) {
        const po = await this.prisma.purchase_orders.findUnique({
            where: { po_number: id },
            include: {
                suppliers: true,
                purchase_order_items: { include: { products: true } }
            }
        });
        if (!po) return null;
        return {
            id: po.po_number,
            supplier: po.suppliers,
            date: po.order_date.toISOString().split('T')[0],
            expectedDate: po.expected_date ? po.expected_date.toISOString().split('T')[0] : null,
            status: this.mapStatus(po.status),
            prRef: po.pr_number,
            notes: po.notes,
            items: po.purchase_order_items.map(item => ({
                id: item.id,
                productId: item.product_id,
                productName: item.products.name,
                sku: item.products.sku,
                quantity: item.quantity,
                unitPrice: Number(item.unit_price),
                totalPrice: Number(item.total_price)
            })),
            totalAmount: Number(po.total_amount)
        };
    }

    async create(data: any) {
        const { supplierId, prNumber, items, notes, expectedDate } = data;

        return this.prisma.$transaction(async (tx) => {
            const poNumber = `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
            const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

            const po = await tx.purchase_orders.create({
                data: {
                    id: `po-${Date.now()}`,
                    po_number: poNumber,
                    supplier_id: supplierId,
                    pr_number: prNumber,
                    status: 'sent' as any,
                    order_date: new Date(),
                    expected_date: expectedDate ? new Date(expectedDate) : null,
                    total_amount: totalAmount,
                    notes: notes,
                }
            });

            for (const item of items) {
                await tx.purchase_order_items.create({
                    data: {
                        id: `poi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        po_id: po.id,
                        product_id: item.productId,
                        quantity: Number(item.quantity),
                        unit_price: Number(item.unitPrice),
                        total_price: Number(item.quantity) * Number(item.unitPrice)
                    }
                });
            }
            return po;
        });
    }

    private mapStatus(status: string): string {
        const map: Record<string, string> = {
            draft: 'Draft',
            sent: 'Sent',
            partially_received: 'Partially Received',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return map[status] || status;
    }
}
