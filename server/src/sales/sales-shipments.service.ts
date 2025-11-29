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
            const shipmentNumber = `SH-${new Date().getFullYear()}-${Date.now().toString().slice(-3).padStart(3, '0')}`;

            const shipment = await tx.sales_shipments.create({
                data: {
                    id: `ship-${Date.now()}`,
                    shipment_number: shipmentNumber,
                    customer_name: data.customerName,
                    shipping_address: data.shippingAddress,
                    status: 'draft' as any,
                    shipment_date: data.shippedDate ? new Date(data.shippedDate) : null,
                    tracking_number: data.trackingNumber,
                    notes: data.notes,
                    users: { connect: { id: 'user-admin-001' } },
                    updated_at: new Date(),
                }
            });

            const lowStockAlerts: any[] = [];

            for (const item of data.items) {
                const product = await tx.products.findUnique({
                    where: { id: item.productId }
                });

                if (product) {
                    const unitPrice = Number(product.unit_price) || 0;
                    
                    await tx.shipment_items.create({
                        data: {
                            id: `shi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            shipment_id: shipment.id,
                            product_id: item.productId,
                            quantity: Number(item.quantity),
                            unit_price: unitPrice,
                            total_price: Number(item.quantity) * unitPrice,
                        }
                    });

                    // Check for Low Stock (don't update inventory until shipped)
                    if (product) {
                        const currentStock = await tx.inventory_levels.findUnique({
                            where: { product_id: product.id },
                        });
                        const stockLevel = currentStock?.quantity || 0;
                        if (stockLevel <= product.minimum_stock) {
                            lowStockAlerts.push({
                                productName: product.name,
                                sku: product.sku,
                                quantity: stockLevel,
                                minStock: product.minimum_stock
                            });
                        }
                    }
                }
            }

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

        // Send notification
        await this.notificationsService.create({
            title: 'New Shipment Created',
            message: `Shipment ${result.shipment.shipment_number} created for ${data.customerName}`,
            type: 'info',
            link: '/sales/shipments'
        });

        return result.shipment;
    }

    async updateStatus(id: string, status: string) {
        return await this.prisma.$transaction(async (tx) => {
            const updateData: any = { status: status as any };

            if (status === 'shipped') {
                updateData.shipment_date = new Date();

                // Get shipment items to update inventory
                const shipment = await tx.sales_shipments.findUnique({
                    where: { shipment_number: id },
                    include: { shipment_items: true }
                });

                if (shipment) {
                    // Update inventory for each item
                    for (const item of shipment.shipment_items) {
                        const currentStock = await tx.inventory_levels.findUnique({
                            where: { product_id: item.product_id },
                        });

                        const quantityBefore = currentStock?.quantity || 0;
                        const quantityAfter = quantityBefore - item.quantity;

                        await tx.inventory_levels.upsert({
                            where: { product_id: item.product_id },
                            update: {
                                quantity: quantityAfter,
                                updated_at: new Date(),
                            },
                            create: {
                                product_id: item.product_id,
                                quantity: quantityAfter,
                                updated_at: new Date(),
                            },
                        });

                        // Create transaction record
                        await tx.inventory_transactions.create({
                            data: {
                                id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                product_id: item.product_id,
                                transaction_type: 'shipped',
                                quantity: -item.quantity,
                                unit_price: item.unit_price,
                                total_amount: item.total_price,
                                reference_id: shipment.shipment_number,
                                notes: `Shipment ${shipment.shipment_number} (Before: ${quantityBefore}, After: ${quantityAfter})`,
                                user_id: 'user-admin-001',
                                transaction_date: new Date(),
                            }
                        });
                    }
                }
            }

            if (status === 'delivered') {
                updateData.delivered_date = new Date();
            }

            return tx.sales_shipments.update({
                where: { shipment_number: id },
                data: updateData
            });
        });
    }

    private mapStatus(status: string): string {
        const map: Record<string, string> = {
            draft: 'Draft',
            pending: 'Pending',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return map[status] || status;
    }
}
