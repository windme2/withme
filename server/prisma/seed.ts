import { PrismaClient } from '../generated/client/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting seed...');

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Admin User
    const adminUser = await prisma.users.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            id: 'user-admin-001',
            email: 'admin@example.com',
            username: 'admin',
            password_hash: hashedPassword,
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            updated_at: new Date(),
        },
    });
    console.log('✅ Created admin user:', adminUser.email);

    // 2. Create Categories
    const categories = await Promise.all([
        prisma.categories.upsert({
            where: { id: 'cat-1' },
            update: {},
            create: {
                id: 'cat-1',
                name: 'Electronics',
                description: 'Electronic devices and accessories',
            },
        }),
        prisma.categories.upsert({
            where: { id: 'cat-2' },
            update: {},
            create: {
                id: 'cat-2',
                name: 'Office Supplies',
                description: 'Office stationery and supplies',
            },
        }),
    ]);
    console.log('✅ Created categories:', categories.length);

    // 3. Create Suppliers
    const suppliers = await Promise.all([
        prisma.suppliers.upsert({
            where: { id: 'sup-1' },
            update: {},
            create: {
                id: 'sup-1',
                name: 'Tech World Co.',
                contact_person: 'John Doe',
                email: 'john@techworld.com',
                phone: '02-123-4567',
                address: '123 Tech Street, Bangkok',
                tax_id: '1234567890123',
                payment_terms: 30,
                updated_at: new Date(),
            },
        }),
        prisma.suppliers.upsert({
            where: { id: 'sup-2' },
            update: {},
            create: {
                id: 'sup-2',
                name: 'Office Plus Ltd.',
                contact_person: 'Jane Smith',
                email: 'jane@officeplus.com',
                phone: '02-987-6543',
                address: '456 Office Road, Bangkok',
                tax_id: '9876543210987',
                payment_terms: 15,
                updated_at: new Date(),
            },
        }),
    ]);
    console.log('✅ Created suppliers:', suppliers.length);

    // 4. Create Products
    const products = await Promise.all([
        prisma.products.upsert({
            where: { id: 'prod-1' },
            update: {},
            create: {
                id: 'prod-1',
                sku: 'ELEC-001',
                name: 'Wireless Mouse',
                description: 'Ergonomic wireless mouse',
                category_id: 'cat-1',
                unit: 'piece',
                minimum_stock: 10,
                maximum_stock: 100,
                reorder_point: 20,
                updated_at: new Date(),
            },
        }),
        prisma.products.upsert({
            where: { id: 'prod-2' },
            update: {},
            create: {
                id: 'prod-2',
                sku: 'ELEC-002',
                name: 'USB-C Cable 2m',
                description: 'High-speed USB-C cable',
                category_id: 'cat-1',
                unit: 'piece',
                minimum_stock: 20,
                maximum_stock: 200,
                reorder_point: 30,
                updated_at: new Date(),
            },
        }),
        prisma.products.upsert({
            where: { id: 'prod-3' },
            update: {},
            create: {
                id: 'prod-3',
                sku: 'OFF-001',
                name: 'A4 Paper 80gsm',
                description: 'White A4 paper, 500 sheets/ream',
                category_id: 'cat-2',
                unit: 'ream',
                minimum_stock: 50,
                maximum_stock: 500,
                reorder_point: 100,
                updated_at: new Date(),
            },
        }),
        prisma.products.upsert({
            where: { id: 'prod-4' },
            update: {},
            create: {
                id: 'prod-4',
                sku: 'OFF-002',
                name: 'Stapler Heavy Duty',
                description: 'Metal stapler for heavy use',
                category_id: 'cat-2',
                unit: 'piece',
                minimum_stock: 5,
                maximum_stock: 50,
                reorder_point: 10,
                updated_at: new Date(),
            },
        }),
    ]);
    console.log('✅ Created products:', products.length);

    // 5. Create Inventory Levels
    await Promise.all([
        prisma.inventory_levels.upsert({
            where: { product_id: 'prod-1' },
            update: {},
            create: {
                product_id: 'prod-1',
                quantity: 45,
                last_counted_at: new Date(),
                last_counted_by: null,
                updated_at: new Date(),
            },
        }),
        prisma.inventory_levels.upsert({
            where: { product_id: 'prod-2' },
            update: {},
            create: {
                product_id: 'prod-2',
                quantity: 120,
                last_counted_at: new Date(),
                last_counted_by: null,
                updated_at: new Date(),
            },
        }),
        prisma.inventory_levels.upsert({
            where: { product_id: 'prod-3' },
            update: {},
            create: {
                product_id: 'prod-3',
                quantity: 250,
                last_counted_at: new Date(),
                last_counted_by: null,
                updated_at: new Date(),
            },
        }),
        prisma.inventory_levels.upsert({
            where: { product_id: 'prod-4' },
            update: {},
            create: {
                product_id: 'prod-4',
                quantity: 15,
                last_counted_at: new Date(),
                last_counted_by: null,
                updated_at: new Date(),
            },
        }),
    ]);
    console.log('✅ Created inventory levels');

    // 6. Create Goods Received Notes
    const grn1 = await prisma.goods_received.upsert({
        where: { id: 'grn-1' },
        update: {},
        create: {
            id: 'grn-1',
            grn_number: 'GRN-2025-001',
            supplier_id: 'sup-1',
            received_date: new Date('2025-01-15'),
            received_by: 'user-admin-001',
            status: 'completed',
            total_amount: 12500.00,
            notes: 'First delivery of electronics',
            updated_at: new Date(),
        },
    });

    await Promise.all([
        prisma.goods_received_items.create({
            data: {
                id: 'grn-item-1',
                grn_id: 'grn-1',
                product_id: 'prod-1',
                quantity: 50,
                unit_price: 150.00,
                total_price: 7500.00,
            },
        }),
        prisma.goods_received_items.create({
            data: {
                id: 'grn-item-2',
                grn_id: 'grn-1',
                product_id: 'prod-2',
                quantity: 100,
                unit_price: 50.00,
                total_price: 5000.00,
            },
        }),
    ]);

    const grn2 = await prisma.goods_received.upsert({
        where: { id: 'grn-2' },
        update: {},
        create: {
            id: 'grn-2',
            grn_number: 'GRN-2025-002',
            supplier_id: 'sup-2',
            received_date: new Date('2025-01-18'),
            received_by: 'user-admin-001',
            status: 'pending',
            total_amount: 8750.00,
            notes: 'Office supplies delivery',
            updated_at: new Date(),
        },
    });

    await Promise.all([
        prisma.goods_received_items.create({
            data: {
                id: 'grn-item-3',
                grn_id: 'grn-2',
                product_id: 'prod-3',
                quantity: 300,
                unit_price: 25.00,
                total_price: 7500.00,
            },
        }),
        prisma.goods_received_items.create({
            data: {
                id: 'grn-item-4',
                grn_id: 'grn-2',
                product_id: 'prod-4',
                quantity: 25,
                unit_price: 50.00,
                total_price: 1250.00,
            },
        }),
    ]);

    console.log('✅ Created GRNs:', 2);

    // 7. Create Inventory Adjustments
    const adj1 = await prisma.inventory_adjustments.upsert({
        where: { id: 'adj-1' },
        update: {},
        create: {
            id: 'adj-1',
            adjustment_number: 'ADJ-2025-001',
            adjustment_type: 'count',
            status: 'approved',
            adjusted_by: 'user-admin-001',
            approved_by: 'user-admin-001',
            adjustment_date: new Date('2025-01-10'),
            notes: 'Stock count adjustment',
            updated_at: new Date(),
        },
    });

    await prisma.adjustment_items.create({
        data: {
            id: 'adj-item-1',
            adjustment_id: 'adj-1',
            product_id: 'prod-1',
            quantity_before: 40,
            quantity_after: 45,
            reason: 'Found missing stock in warehouse B',
        },
    });

    const adj2 = await prisma.inventory_adjustments.upsert({
        where: { id: 'adj-2' },
        update: {},
        create: {
            id: 'adj-2',
            adjustment_number: 'ADJ-2025-002',
            adjustment_type: 'damage',
            status: 'approved',
            adjusted_by: 'user-admin-001',
            approved_by: 'user-admin-001',
            adjustment_date: new Date('2025-01-12'),
            notes: 'Damaged items removal',
            updated_at: new Date(),
        },
    });

    await prisma.adjustment_items.create({
        data: {
            id: 'adj-item-2',
            adjustment_id: 'adj-2',
            product_id: 'prod-2',
            quantity_before: 125,
            quantity_after: 120,
            reason: 'Water damage from leak',
        },
    });

    const adj3 = await prisma.inventory_adjustments.upsert({
        where: { id: 'adj-3' },
        update: {},
        create: {
            id: 'adj-3',
            adjustment_number: 'ADJ-2025-003',
            adjustment_type: 'loss',
            status: 'pending',
            adjusted_by: 'user-admin-001',
            adjustment_date: new Date('2025-01-14'),
            notes: 'Missing items',
            updated_at: new Date(),
        },
    });

    await prisma.adjustment_items.create({
        data: {
            id: 'adj-item-3',
            adjustment_id: 'adj-3',
            product_id: 'prod-4',
            quantity_before: 18,
            quantity_after: 15,
            reason: 'Could not locate during inventory check',
        },
    });

    console.log('✅ Created adjustments:', 3);

    console.log('🎉 Seed completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
