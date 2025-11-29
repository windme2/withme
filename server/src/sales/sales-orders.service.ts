import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesOrdersService {
    constructor(private prisma: PrismaService) { }

    async findAll(status?: string, search?: string) {
        const where: any = {};
        if (status && status !== 'all') {
            where.status = status.toLowerCase();
        }
        if (search) {
            where.OR = [
                { so_number: { contains: search, mode: 'insensitive' } },
                { customer_name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const orders = await this.prisma.sales_orders.findMany({
            where,
            include: { sales_order_items: true },
            orderBy: { created_at: 'desc' }
        });

        return orders.map(order => ({
            id: order.so_number,
            customer: order.customer_name,
            contactPerson: order.contact_person,
            date: order.order_date.toISOString().split('T')[0],
            dueDate: order.due_date ? order.due_date.toISOString().split('T')[0] : null,
            totalQty: order.sales_order_items.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: Number(order.total_amount),
            status: this.mapStatus(order.status),
        }));
    }

    async findOne(id: string): Promise<any> {
        const order = await this.prisma.sales_orders.findUnique({
            where: { so_number: id },
            include: {
                sales_order_items: {
                    include: {
                        products: true,
                    },
                },
            },
        });

        if (!order) return null;

        const items = order.sales_order_items.map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.products.name,
            sku: item.products.sku,
            qty: item.quantity,
            quantity: item.quantity,
            price: Number(item.unit_price),
            unitPrice: Number(item.unit_price),
            totalPrice: Number(item.total_price),
            unit: item.products.unit || 'pcs',
        }));

        return {
            id: order.so_number,
            soNumber: order.so_number,
            customerName: order.customer_name,
            customer: order.customer_name,
            contactPerson: order.contact_person,
            customerEmail: order.customer_email,
            customerPhone: order.customer_phone,
            orderDate: order.order_date,
            date: order.order_date.toISOString().split('T')[0],
            dueDate: order.due_date ? order.due_date.toISOString().split('T')[0] : null,
            status: this.mapStatus(order.status),
            notes: order.notes,
            items: items,
            salesOrderItems: items,
            totalQty: items.reduce((sum, item) => sum + item.quantity, 0),
            totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: Number(order.total_amount),
            totalAmount: Number(order.total_amount),
        };
    }

    async create(data: any) {
        const { customerName, contactPerson, email, phone, dueDate, items, notes } = data;

        return this.prisma.$transaction(async (tx) => {
            const soNumber = `SO-${new Date().getFullYear()}-${Date.now().toString().slice(-3).padStart(3, '0')}`;
            const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);

            const order = await tx.sales_orders.create({
                data: {
                    id: `so-${Date.now()}`,
                    so_number: soNumber,
                    customer_name: customerName,
                    contact_person: contactPerson,
                    customer_email: email,
                    customer_phone: phone,
                    status: 'draft' as any,
                    order_date: new Date(),
                    due_date: dueDate ? new Date(dueDate) : null,
                    total_amount: totalAmount,
                    notes: notes,
                    created_by: 'user-admin-001', // TODO: Replace with actual user ID
                }
            });

            for (const item of items) {
                await tx.sales_order_items.create({
                    data: {
                        id: `soi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        so_id: order.id,
                        product_id: item.productId,
                        quantity: Number(item.quantity),
                        unit_price: Number(item.unitPrice),
                        total_price: Number(item.quantity) * Number(item.unitPrice)
                    }
                });
            }
            return order;
        });
    }

    async createWithNotification(data: any, notificationsService: any) {
        const order = await this.create(data);
        
        // Send notification
        await notificationsService.create({
            title: 'New Sales Order',
            message: `Sales Order ${order.so_number} created for ${data.customerName}`,
            type: 'info',
            link: '/sales/orders'
        });
        
        return order;
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.sales_orders.update({
            where: { so_number: id },
            data: { status: status as any }
        });
    }

    private mapStatus(status: string): string {
        const map: Record<string, string> = {
            draft: 'Draft',
            confirmed: 'Confirmed',
            shipped: 'Shipped',
            completed: 'Completed',
            cancelled: 'Cancelled'
        };
        return map[status] || status;
    }
}
