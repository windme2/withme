import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return await this.prisma.suppliers.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    async findOne(id: string) {
        return await this.prisma.suppliers.findUnique({
            where: { id },
        });
    }

    async create(data: any) {
        return await this.prisma.suppliers.create({
            data: {
                id: `SUP-${Date.now()}`,
                name: data.name,
                contact_person: data.contactPerson,
                email: data.email,
                phone: data.phone,
                address: data.address,
                tax_id: data.taxId,
                payment_terms: data.paymentTerms,
                updated_at: new Date(),
            },
        });
    }

    async update(id: string, data: any) {
        return await this.prisma.suppliers.update({
            where: { id },
            data: {
                name: data.name,
                contact_person: data.contactPerson,
                email: data.email,
                phone: data.phone,
                address: data.address,
                tax_id: data.taxId,
                payment_terms: data.paymentTerms,
                updated_at: new Date(),
            },
        });
    }

    async remove(id: string) {
        // Check if supplier has any goods received
        const hasGRN = await this.prisma.goods_received.count({
            where: { supplier_id: id },
        });

        if (hasGRN > 0) {
            throw new Error('Cannot delete supplier with existing transactions');
        }

        return await this.prisma.suppliers.delete({
            where: { id },
        });
    }
}
