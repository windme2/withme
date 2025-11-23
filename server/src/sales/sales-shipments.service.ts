import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesShipmentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(status?: string, search?: string) {
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status.toLowerCase();
        }

        if (search) {
            where.OR = [
                { shipment_number: { contains: search, mode: 'insensitive' } },
                { customer_name: { contains: search, mode: 'insensitive' } },
                { tracking_number: { contains: search, mode: 'insensitive' } },
            ];
        }

        const shipments = await this.prisma.sales_shipments.findMany({
            where,
            include: { shipment_items: { include: { products: true } } },
            orderBy: { created_at: 'desc' }
        });

        return shipments.map(shipment => ({
            id: shipment.shipment_number,
            shipmentNumber: shipment.shipment_number,
            customerName: shipment.customer_name,
            shippingAddress: shipment.shipping_address,
            status: this.mapStatus(shipment.status),
            shipmentDate: shipment.shipment_date?.toISOString().split('T')[0],
            deliveredDate: shipment.delivered_date?.toISOString().split('T')[0],
            trackingNumber: shipment.tracking_number,
            totalItems: shipment.shipment_items.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: shipment.shipment_items.reduce((sum, item) => sum + Number(item.total_price), 0),
        }));
    }

    async findOne(id: string) {
        const shipment = await this.prisma.sales_shipments.findUnique({
            where: { shipment_number: id },
            include: { shipment_items: { include: { products: true } } }
        });

        if (!shipment) return null;

        return {
            id: shipment.shipment_number,
            shipmentNumber: shipment.shipment_number,
            customerName: shipment.customer_name,
            shippingAddress: shipment.shipping_address,
            status: this.mapStatus(shipment.status),
            shipmentDate: shipment.shipment_date?.toISOString().split('T')[0],
            deliveredDate: shipment.delivered_date?.toISOString().split('T')[0],
            trackingNumber: shipment.tracking_number,
            notes: shipment.notes,
            items: shipment.shipment_items.map(item => ({
                id: item.id,
                name: item.products.name,
                sku: item.products.sku,
                quantity: item.quantity,
                unitPrice: Number(item.unit_price),
                totalPrice: Number(item.total_price),
                unit: item.products.unit,
            })),
        };
    }

    async create(data: any) {
        return this.prisma.$transaction(async (tx) => {
            const shipmentNumber = `SH-${new Date().getFullYear()}-${Date.now().toString().slice(-3).padStart(3, '0')}`;

            const shipment = await tx.sales_shipments.create({
                data: {
                    id: `ship-${Date.now()}`,
                    shipment_number: shipmentNumber,
                    customer_name: data.customerName,
                    shipping_address: data.shippingAddress,
                    status: 'pending' as any,
                    shipment_date: data.shipmentDate ? new Date(data.shipmentDate) : null,
                    tracking_number: data.trackingNumber,
                    notes: data.notes,
                    handled_by: 'user-admin-001',
                    updated_at: new Date(),
                }
            });

            for (const item of data.items) {
                await tx.shipment_items.create({
                    data: {
                        id: `shi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        shipment_id: shipment.id,
                        product_id: item.productId,
                        quantity: Number(item.quantity),
                        unit_price: Number(item.unitPrice),
                        total_price: Number(item.quantity) * Number(item.unitPrice),
                    }
                });
            }

            return shipment;
        });
    }

    async updateStatus(id: string, status: string) {
        const updateData: any = { status: status as any };

        if (status === 'shipped' && !updateData.shipment_date) {
            updateData.shipment_date = new Date();
        }

        if (status === 'delivered') {
            updateData.delivered_date = new Date();
        }

        return this.prisma.sales_shipments.update({
            where: { shipment_number: id },
            data: updateData
        });
    }

    private mapStatus(status: string): string {
        const map: Record<string, string> = {
            pending: 'Pending',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return map[status] || status;
    }
}
