import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SalesShipmentsService {
    constructor(
        private prisma: PrismaService,
        private notificationsService: NotificationsService
    ) { }

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
        const result = await this.prisma.$transaction(async (tx) => {
            // Fetch Sales Order to get customer details
            const salesOrder = await tx.sales_orders.findUnique({
                where: { so_number: data.salesOrderId } // Assuming salesOrderId is the SO Number (e.g. SO-2025-...)
            });

            if (!salesOrder) {
                throw new Error('Sales Order not found');
            }

            const shipmentNumber = `SH-${new Date().getFullYear()}-${Date.now().toString().slice(-3).padStart(3, '0')}`;

            const shipment = await tx.sales_shipments.create({
                data: {
                    id: `ship-${Date.now()}`,
                    shipment_number: shipmentNumber,
                    customer_name: salesOrder.customer_name,
                    shipping_address: salesOrder.contact_person || 'Address not provided', // Fallback as address is not in SO table
                    status: 'shipped' as any,
                    shipment_date: data.shipmentDate ? new Date(data.shipmentDate) : null,
                    tracking_number: data.trackingNumber,
                    notes: data.notes,
                    users: { connect: { id: 'user-admin-001' } },
                    updated_at: new Date(),
                }
            });

            const lowStockAlerts: any[] = [];

            for (const item of data.items) {
                // Fetch product details for unit price if not provided
                const soItem = await tx.sales_order_items.findUnique({
                    where: { id: item.salesOrderItemId },
                    include: { products: true }
                });

                if (soItem) {
                    await tx.shipment_items.create({
                        data: {
                            id: `shi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            shipment_id: shipment.id,
                            product_id: soItem.product_id,
                            quantity: Number(item.quantity),
                            unit_price: Number(soItem.unit_price),
                            total_price: Number(item.quantity) * Number(soItem.unit_price),
                        }
                    });

                    // Update Inventory Level (Decrease stock)
                    const currentStock = await tx.inventory_levels.findUnique({
                        where: { product_id: soItem.product_id },
                    });

                    const quantityBefore = currentStock?.quantity || 0;
                    const quantityAfter = quantityBefore - Number(item.quantity);

                    await tx.inventory_levels.upsert({
                        where: { product_id: soItem.product_id },
                        update: {
                            quantity: quantityAfter,
                            updated_at: new Date(),
                        },
                        create: {
                            product_id: soItem.product_id,
                            quantity: quantityAfter,
                            updated_at: new Date(),
                        },
                    });

                    // Check for Low Stock
                    const product = soItem.products;
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

            // Update SO status to Shipped if fully shipped (simplified logic)
            await tx.sales_orders.update({
                where: { id: salesOrder.id },
                data: { status: 'shipped' as any }
            });

            return { shipment, lowStockAlerts };
        });

        // Send Notifications (outside transaction)
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

        return result.shipment;
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
