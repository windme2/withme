import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async findAll(search?: string, isActive?: string) {
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { customer_code: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isActive && isActive !== 'all') {
            where.is_active = isActive === 'true';
        }

        const customers = await this.prisma.customers.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });

        return customers.map(customer => ({
            id: customer.id,
            customerCode: customer.customer_code,
            name: customer.name,
            contactPerson: customer.contact_person,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            taxId: customer.tax_id,
            creditLimit: customer.credit_limit ? Number(customer.credit_limit) : null,
            paymentTerms: customer.payment_terms,
            isActive: customer.is_active,
            createdAt: customer.created_at.toISOString(),
        }));
    }

    async findOne(id: string) {
        const customer = await this.prisma.customers.findUnique({
            where: { id }
        });

        if (!customer) return null;

        return {
            id: customer.id,
            customerCode: customer.customer_code,
            name: customer.name,
            contactPerson: customer.contact_person,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            taxId: customer.tax_id,
            creditLimit: customer.credit_limit ? Number(customer.credit_limit) : null,
            paymentTerms: customer.payment_terms,
            isActive: customer.is_active,
        };
    }

    async create(data: any) {
        const customerCode = `C-${new Date().getFullYear()}-${Date.now().toString().slice(-3).padStart(3, '0')}`;

        return this.prisma.customers.create({
            data: {
                id: `cust-${Date.now()}`,
                customer_code: customerCode,
                name: data.name,
                contact_person: data.contactPerson,
                email: data.email,
                phone: data.phone,
                address: data.address,
                tax_id: data.taxId,
                credit_limit: data.creditLimit,
                payment_terms: data.paymentTerms,
                is_active: true,
            }
        });
    }

    async update(id: string, data: any) {
        return this.prisma.customers.update({
            where: { id },
            data: {
                name: data.name,
                contact_person: data.contactPerson,
                email: data.email,
                phone: data.phone,
                address: data.address,
                tax_id: data.taxId,
                credit_limit: data.creditLimit,
                payment_terms: data.paymentTerms,
                is_active: data.isActive,
            }
        });
    }

    async delete(id: string) {
        return this.prisma.customers.delete({
            where: { id }
        });
    }
}
