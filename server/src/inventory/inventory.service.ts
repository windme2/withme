import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const products = await this.prisma.products.findMany({
            include: {
                categories: true,
                inventory_levels: true,
            }
        });

        return products.map(product => {
            const quantity = product.inventory_levels?.quantity || 0;
            const unitPrice = Number(product.unit_price) || 0;
            const amount = quantity * unitPrice;
            
            return {
                id: product.id,
                name: product.name,
                sku: product.sku,
                category: product.categories?.name || 'Uncategorized',
                stock: quantity,
                unitPrice: unitPrice,
                amount: amount,
                minStock: product.minimum_stock,
                maxStock: product.maximum_stock || product.minimum_stock * 2,
                status: this.determineStatus(quantity, product.minimum_stock),
            };
        });
    }

    private determineStatus(stock: number, minStock: number): string {
        if (stock <= 0) return 'Out of Stock';
        if (stock <= minStock) return 'Low Stock';
        return 'In Stock';
    }

    async update(id: string, data: any) {
        // Note: In a real app, use a DTO
        return this.prisma.products.update({
            where: { id },
            data: {
                category_id: data.categoryId,
                unit_price: data.unitPrice,
                minimum_stock: data.minStock,
                maximum_stock: data.maxStock,
                updated_at: new Date(),
            },
            include: {
                inventory_levels: true,
                categories: true
            }
        });
    }
}
