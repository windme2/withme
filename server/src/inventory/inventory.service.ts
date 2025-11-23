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

        return products.map(product => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.categories?.name || 'Uncategorized',
            stock: product.inventory_levels?.quantity || 0,
            price: 0, // Placeholder as price is not in products table
            status: this.determineStatus(product.inventory_levels?.quantity || 0, product.minimum_stock),
        }));
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
                name: data.name,
                // sku: data.sku, // SKU usually not editable
                // category: ... // logic to update category relation
                inventory_levels: {
                    update: {
                        quantity: data.stock
                    }
                }
            },
            include: {
                inventory_levels: true,
                categories: true
            }
        });
    }
}
