import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesReturnsService {
    constructor(private prisma: PrismaService) { }

    async findAll(status?: string, search?: string) {
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status.toLowerCase();
        }

        if (search) {
            where.OR = [
                { return_number: { contains: search, mode: 'insensitive' } },
                { customer_name: { contains: search, mode: 'insensitive' } },
                { so_number: { contains: search, mode: 'insensitive' } },
            ];
        }

        const returns = await this.prisma.sales_returns.findMany({
            where,
            include: { return_items: { include: { products: true } } },
            orderBy: { created_at: 'desc' }
        });

        return returns.map(ret => ({
            id: ret.return_number,
            returnNumber: ret.return_number,
            soNumber: ret.so_number,
            customerName: ret.customer_name,
            returnDate: ret.return_date.toISOString().split('T')[0],
            status: this.mapStatus(ret.status),
            reason: ret.reason,
            refundMethod: ret.refund_method,
            totalAmount: Number(ret.total_amount),
            totalItems: ret.return_items.reduce((sum, item) => sum + item.quantity, 0),
        }));
    }

    async findOne(id: string) {
        const ret = await this.prisma.sales_returns.findUnique({
            where: { return_number: id },
            include: { return_items: { include: { products: true } } }
        });

        if (!ret) return null;

        return {
            id: ret.return_number,
            returnNumber: ret.return_number,
            soNumber: ret.so_number,
            customerName: ret.customer_name,
            returnDate: ret.return_date.toISOString().split('T')[0],
            status: this.mapStatus(ret.status),
            reason: ret.reason,
            refundMethod: ret.refund_method,
            totalAmount: Number(ret.total_amount),
            notes: ret.notes,
            items: ret.return_items.map(item => ({
                id: item.id,
                name: item.products.name,
                sku: item.products.sku,
                quantity: item.quantity,
                unitPrice: Number(item.unit_price),
                totalPrice: Number(item.total_price),
                condition: item.condition,
                unit: item.products.unit,
            })),
        };
    }

    async create(data: any) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // Fetch Sales Order to get ID
                const salesOrder = await tx.sales_orders.findUnique({
                    where: { so_number: data.soNumber }
                });

                if (!salesOrder) {
                    throw new Error('Sales Order not found');
                }

                // Prepare items with prices
                const itemsWithPrice: any[] = [];
                let totalAmount = 0;

                for (const item of data.items) {
                    const soItem = await tx.sales_order_items.findFirst({
                        where: {
                            so_id: salesOrder.id,
                            product_id: item.productId
                        }
                    });

                    const unitPrice = soItem ? Number(soItem.unit_price) : 0;
                    totalAmount += Number(item.quantity) * unitPrice;

                    itemsWithPrice.push({
                        ...item,
                        unitPrice
                    });
                }

                const returnNumber = `RET-${new Date().getFullYear()}-${Date.now().toString().slice(-3).padStart(3, '0')}`;

                const salesReturn = await tx.sales_returns.create({
                    data: {
                        id: `ret-${Date.now()}`,
                        return_number: returnNumber,
                        so_number: data.soNumber,
                        customer_name: data.customerName,
                        return_date: new Date(),
                        status: 'pending' as any,
                        reason: data.reason,
                        total_amount: totalAmount,
                        refund_method: data.refundMethod,
                        notes: data.notes,
                        users: { connect: { id: 'user-admin-001' } }
                    }
                });

                for (const item of itemsWithPrice) {
                    await tx.return_items.create({
                        data: {
                            id: `reti-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            return_id: salesReturn.id,
                            product_id: item.productId,
                            quantity: Number(item.quantity),
                            unit_price: item.unitPrice,
                            total_price: Number(item.quantity) * item.unitPrice,
                            condition: item.condition,
                        }
                    });
                }

                return salesReturn;
            });
        } catch (error) {
            console.error('Error creating sales return:', error);
            throw error;
        }
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.sales_returns.update({
            where: { return_number: id },
            data: { status: status as any }
        });
    }

    private mapStatus(status: string): string {
        const map: Record<string, string> = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            completed: 'Completed'
        };
        return map[status] || status;
    }
}
