import { PrismaClient } from '../generated/client/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting full seed with comprehensive data...');

    // 1. Create Users
    const adminUser = await prisma.users.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            id: 'user-admin-001',
            email: 'admin@withme.com',
            username: 'admin',
            password_hash: 'admin123',
            first_name: 'Admin',
            last_name: 'System',
            role: 'admin',
            updated_at: new Date(),
        },
    });

    const jameUser = await prisma.users.upsert({
        where: { username: 'jame' },
        update: {},
        create: {
            id: 'user-admin-002',
            email: 'jame@withme.com',
            username: 'jame',
            password_hash: 'admin123',
            first_name: 'Thinnakrit',
            last_name: 'C.',
            role: 'admin',
            updated_at: new Date(),
        },
    });

    const windUser = await prisma.users.upsert({
        where: { username: 'wind' },
        update: {},
        create: {
            id: 'user-admin-003',
            email: 'wind@withme.com',
            username: 'wind',
            password_hash: 'admin123',
            first_name: 'Intouch',
            last_name: 'C.',
            role: 'admin',
            updated_at: new Date(),
        },
    });

    const regularUser = await prisma.users.upsert({
        where: { username: 'user' },
        update: {},
        create: {
            id: 'user-regular-001',
            email: 'user@withme.com',
            username: 'user',
            password_hash: 'user123',
            first_name: 'Regular',
            last_name: 'User',
            role: 'user',
            updated_at: new Date(),
        },
    });
    console.log('✅ Created 4 users');

    // 2. Create Categories
    const electronicsCategory = await prisma.categories.upsert({
        where: { id: 'cat-1' },
        update: {},
        create: {
            id: 'cat-1',
            name: 'Electronics',
            description: 'Electronic devices and accessories',
        },
    });

    const officeCategory = await prisma.categories.upsert({
        where: { id: 'cat-2' },
        update: {},
        create: {
            id: 'cat-2',
            name: 'Office Supplies',
            description: 'Office stationery and supplies',
        },
    });
    console.log('✅ Created 2 categories');

    // 3. Create Suppliers
    const supplier1 = await prisma.suppliers.upsert({
        where: { id: 'sup-1' },
        update: {},
        create: {
            id: 'sup-1',
            name: 'Tech World Co., Ltd.',
            contact_person: 'John Doe',
            email: 'john@techworld.com',
            phone: '02-123-4567',
            address: '123 Tech Street, Bangkok 10110',
            tax_id: '0105558123456',
            payment_terms: 30,
            updated_at: new Date(),
        },
    });

    const supplier2 = await prisma.suppliers.upsert({
        where: { id: 'sup-2' },
        update: {},
        create: {
            id: 'sup-2',
            name: 'Office Plus Ltd.',
            contact_person: 'Jane Smith',
            email: 'jane@officeplus.com',
            phone: '02-987-6543',
            address: '456 Office Road, Bangkok 10220',
            tax_id: '0105559987654',
            payment_terms: 15,
            updated_at: new Date(),
        },
    });
    console.log('✅ Created 2 suppliers');

    // 4. Create Products with unit_price
    const products = await Promise.all([
        prisma.products.upsert({
            where: { id: 'prod-1' },
            update: {},
            create: {
                id: 'prod-1',
                sku: 'ELEC-001',
                name: 'Wireless Mouse',
                description: 'Ergonomic wireless mouse with USB receiver',
                category_id: 'cat-1',
                unit: 'piece',
                unit_price: 450.00,
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
                description: 'High-speed USB-C cable 2 meters',
                category_id: 'cat-1',
                unit: 'piece',
                unit_price: 280.00,
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
                description: 'White A4 paper, 500 sheets per ream',
                category_id: 'cat-2',
                unit: 'ream',
                unit_price: 180.00,
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
                unit_price: 350.00,
                minimum_stock: 5,
                maximum_stock: 50,
                reorder_point: 10,
                updated_at: new Date(),
            },
        }),
    ]);
    console.log('✅ Created 4 products');

    // 5. Create Inventory Levels
    await Promise.all([
        prisma.inventory_levels.upsert({
            where: { product_id: 'prod-1' },
            update: {},
            create: {
                product_id: 'prod-1',
                quantity: 45,
                last_counted_at: new Date(),
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
                updated_at: new Date(),
            },
        }),
    ]);
    console.log('✅ Created inventory levels');

    // 6. Create Purchase Requisitions (PR)
    const pr1 = await prisma.purchase_requisitions.upsert({
        where: { pr_number: 'PR-2025-001' },
        update: {
            // ensure supplier_id updated if seed changes
            supplier_id: 'sup-1',
            status: 'approved',
            requested_date: new Date('2025-11-20'),
            approved_by: 'user-admin-001',
            approved_date: new Date('2025-11-21'),
            notes: 'Urgent restock needed [Priority: High]',
            updated_at: new Date(),
        },
        create: {
            id: 'pr-1',
            pr_number: 'PR-2025-001',
            requested_by: 'user-admin-002',
            department: 'Warehouse',
            supplier_id: 'sup-1',
            status: 'approved',
            requested_date: new Date('2025-11-20'),
            approved_by: 'user-admin-001',
            approved_date: new Date('2025-11-21'),
            notes: 'Urgent restock needed [Priority: High]',
            updated_at: new Date(),
        },
    });

    await Promise.all([
        prisma.purchase_requisition_items.upsert({
            where: { id: 'pr-item-1' },
            update: { estimated_unit_price: 450.00 },
            create: {
                id: 'pr-item-1',
                pr_id: 'pr-1',
                product_id: 'prod-1',
                quantity: 50,
                estimated_unit_price: 450.00,
                status: 'pending',
            },
        }),
        prisma.purchase_requisition_items.upsert({
            where: { id: 'pr-item-2' },
            update: { estimated_unit_price: 280.00 },
            create: {
                id: 'pr-item-2',
                pr_id: 'pr-1',
                product_id: 'prod-2',
                quantity: 100,
                estimated_unit_price: 280.00,
                status: 'pending',
            },
        }),
    ]);

    const pr2 = await prisma.purchase_requisitions.upsert({
        where: { pr_number: 'PR-2025-002' },
        update: {
            supplier_id: 'sup-2',
            status: 'approved',
            requested_date: new Date('2025-11-25'),
            approved_by: 'user-admin-001',
            approved_date: new Date('2025-11-26'),
            notes: 'Monthly office supplies [Priority: Medium]',
            updated_at: new Date(),
        },
        create: {
            id: 'pr-2',
            pr_number: 'PR-2025-002',
            requested_by: 'user-admin-003',
            department: 'Office',
            supplier_id: 'sup-2',
            status: 'approved',
            requested_date: new Date('2025-11-25'),
            approved_by: 'user-admin-001',
            approved_date: new Date('2025-11-26'),
            notes: 'Monthly office supplies [Priority: Medium]',
            updated_at: new Date(),
        },
    });

    await Promise.all([
        prisma.purchase_requisition_items.upsert({
            where: { id: 'pr-item-3' },
            update: { estimated_unit_price: 180.00 },
            create: {
                id: 'pr-item-3',
                pr_id: 'pr-2',
                product_id: 'prod-3',
                quantity: 200,
                estimated_unit_price: 180.00,
                status: 'pending',
            },
        }),
        prisma.purchase_requisition_items.upsert({
            where: { id: 'pr-item-4' },
            update: { estimated_unit_price: 350.00 },
            create: {
                id: 'pr-item-4',
                pr_id: 'pr-2',
                product_id: 'prod-4',
                quantity: 20,
                estimated_unit_price: 350.00,
                status: 'pending',
            },
        }),
    ]);

    const pr3 = await prisma.purchase_requisitions.upsert({
        where: { pr_number: 'PR-2025-003' },
        update: {
            status: 'pending',
            requested_date: new Date('2025-11-27'),
            notes: 'Customer demo units [Priority: Low]',
            updated_at: new Date(),
        },
        create: {
            id: 'pr-3',
            pr_number: 'PR-2025-003',
            requested_by: 'user-regular-001',
            department: 'Sales',
            status: 'pending',
            requested_date: new Date('2025-11-27'),
            notes: 'Customer demo units [Priority: Low]',
            updated_at: new Date(),
        },
    });

    await prisma.purchase_requisition_items.upsert({
        where: { id: 'pr-item-5' },
        update: { estimated_unit_price: 450.00 },
        create: {
            id: 'pr-item-5',
            pr_id: 'pr-3',
            product_id: 'prod-1',
            quantity: 10,
            estimated_unit_price: 450.00,
            status: 'pending',
        },
    });
    console.log('✅ Created 3 PRs');

    // 7. Create Purchase Orders (PO)
    const po1 = await prisma.purchase_orders.upsert({
        where: { id: 'po-1' },
        update: {},
        create: {
            id: 'po-1',
            po_number: 'PO-2025-001',
            supplier_id: 'sup-1',
            pr_number: 'PR-2025-001',
            status: 'sent',
            order_date: new Date('2025-11-22'),
            expected_date: new Date('2025-12-05'),
            // total should match PO items (22500 + 28000 = 50500)
            total_amount: 50500.00,
            notes: 'Please deliver by December 5th',
        },
    });

    await Promise.all([
        prisma.purchase_order_items.upsert({
            where: { id: 'po-item-1' },
            update: {},
            create: {
                id: 'po-item-1',
                po_id: 'po-1',
                product_id: 'prod-1',
                quantity: 50,
                unit_price: 450.00,
                total_price: 22500.00,
            },
        }),
        prisma.purchase_order_items.upsert({
            where: { id: 'po-item-2' },
            update: {},
            create: {
                id: 'po-item-2',
                po_id: 'po-1',
                product_id: 'prod-2',
                quantity: 100,
                unit_price: 280.00,
                total_price: 28000.00,
            },
        }),
    ]);
    console.log('✅ Created 1 PO');

    // 8. Create Goods Received Notes (GRN)
    const grn1 = await prisma.goods_received.upsert({
        where: { id: 'grn-1' },
        update: {},
        create: {
            id: 'grn-1',
            grn_number: 'GRN-2025-001',
            supplier_id: 'sup-1',
            received_date: new Date('2025-11-15'),
            received_by: 'user-admin-003',
            status: 'completed',
            total_amount: 27000.00,
            notes: 'Initial stock received',
            updated_at: new Date(),
        },
    });

    await Promise.all([
        prisma.goods_received_items.upsert({
            where: { id: 'grn-item-1' },
            update: {},
            create: {
                id: 'grn-item-1',
                grn_id: 'grn-1',
                product_id: 'prod-1',
                quantity: 30,
                unit_price: 450.00,
                total_price: 13500.00,
            },
        }),
        prisma.goods_received_items.upsert({
            where: { id: 'grn-item-2' },
            update: {},
            create: {
                id: 'grn-item-2',
                grn_id: 'grn-1',
                product_id: 'prod-2',
                quantity: 50,
                unit_price: 270.00,
                total_price: 13500.00,
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
            received_date: new Date('2025-11-18'),
            received_by: 'user-admin-002',
            status: 'completed',
            total_amount: 42000.00,
            notes: 'Office supplies bulk order',
            updated_at: new Date(),
        },
    });

    await Promise.all([
        prisma.goods_received_items.upsert({
            where: { id: 'grn-item-3' },
            update: {},
            create: {
                id: 'grn-item-3',
                grn_id: 'grn-2',
                product_id: 'prod-3',
                quantity: 200,
                unit_price: 180.00,
                total_price: 36000.00,
            },
        }),
        prisma.goods_received_items.upsert({
            where: { id: 'grn-item-4' },
            update: {},
            create: {
                id: 'grn-item-4',
                grn_id: 'grn-2',
                product_id: 'prod-4',
                quantity: 20,
                unit_price: 300.00,
                total_price: 6000.00,
            },
        }),
    ]);
    console.log('✅ Created 2 GRNs');

    // 9. Create Inventory Adjustments
    const adj1 = await prisma.inventory_adjustments.upsert({
        where: { id: 'adj-1' },
        update: {},
        create: {
            id: 'adj-1',
            adjustment_number: 'ADJ-2025-001',
            adjustment_type: 'count',
            status: 'approved',
            adjusted_by: 'user-admin-003',
            approved_by: 'user-admin-001',
            adjustment_date: new Date('2025-11-10'),
            notes: 'Physical count adjustment',
            updated_at: new Date(),
        },
    });

    await prisma.adjustment_items.upsert({
        where: { id: 'adj-item-1' },
        update: {},
        create: {
            id: 'adj-item-1',
            adjustment_id: 'adj-1',
            product_id: 'prod-1',
            quantity_before: 10,
            quantity_after: 15,
            reason: 'Found in secondary warehouse',
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
            adjusted_by: 'user-admin-002',
            approved_by: 'user-admin-001',
            adjustment_date: new Date('2025-11-12'),
            notes: 'Damaged items removal',
            updated_at: new Date(),
        },
    });

    await prisma.adjustment_items.upsert({
        where: { id: 'adj-item-2' },
        update: {},
        create: {
            id: 'adj-item-2',
            adjustment_id: 'adj-2',
            product_id: 'prod-2',
            quantity_before: 70,
            quantity_after: 70,
            reason: 'Water damage from ceiling leak',
        },
    });
    console.log('✅ Created 2 adjustments');

    // 10. Create Customers
    const customer1 = await prisma.customers.upsert({
        where: { id: 'cust-1' },
        update: {},
        create: {
            id: 'cust-1',
            customer_code: 'CUST-001',
            name: 'ABC Corporation Co., Ltd.',
            contact_person: 'Michael Wong',
            email: 'michael@abccorp.com',
            phone: '02-555-1234',
            address: '789 Business Park, Bangkok 10330',
            tax_id: '0105551111111',
            is_active: true,
            updated_at: new Date(),
        },
    });

    const customer2 = await prisma.customers.upsert({
        where: { id: 'cust-2' },
        update: {},
        create: {
            id: 'cust-2',
            customer_code: 'CUST-002',
            name: 'XYZ Trading Ltd.',
            contact_person: 'Sarah Johnson',
            email: 'sarah@xyztrading.com',
            phone: '02-555-5678',
            address: '321 Commerce Street, Bangkok 10400',
            tax_id: '0105552222222',
            is_active: true,
            updated_at: new Date(),
        },
    });
    console.log('✅ Created 2 customers');

    // 11. Create Sales Orders (SO)
    const so1 = await prisma.sales_orders.upsert({
        where: { id: 'so-1' },
        update: {},
        create: {
            id: 'so-1',
            so_number: 'SO-2025-001',
            customer_name: 'ABC Corporation Co., Ltd.',
            contact_person: 'Michael Wong',
            customer_email: 'michael@abccorp.com',
            customer_phone: '02-555-1234',
            status: 'confirmed',
            order_date: new Date('2025-11-23'),
            due_date: new Date('2025-12-10'),
            total_amount: 17500.00,
            notes: 'Deliver to warehouse by December 10th',
            created_by: 'user-admin-002',
        },
    });

    await Promise.all([
        prisma.sales_order_items.upsert({
            where: { id: 'soi-1' },
            update: {},
            create: {
                id: 'soi-1',
                so_id: 'so-1',
                product_id: 'prod-1',
                quantity: 20,
                unit_price: 500.00,
                total_price: 10000.00,
            },
        }),
        prisma.sales_order_items.upsert({
            where: { id: 'soi-2' },
            update: {},
            create: {
                id: 'soi-2',
                so_id: 'so-1',
                product_id: 'prod-2',
                quantity: 25,
                unit_price: 300.00,
                total_price: 7500.00,
            },
        }),
    ]);

    const so2 = await prisma.sales_orders.upsert({
        where: { id: 'so-2' },
        update: {},
        create: {
            id: 'so-2',
            so_number: 'SO-2025-002',
            customer_name: 'XYZ Trading Ltd.',
            contact_person: 'Sarah Johnson',
            customer_email: 'procurement@xyz-trading.com',
            customer_phone: '02-555-5678',
            status: 'confirmed',
            order_date: new Date('2025-11-25'),
            due_date: new Date('2025-12-15'),
            total_amount: 40000.00,
            notes: 'Standard shipping',
            created_by: 'user-admin-003',
        },
    });

    await prisma.sales_order_items.upsert({
        where: { id: 'soi-3' },
        update: {},
        create: {
            id: 'soi-3',
            so_id: 'so-2',
            product_id: 'prod-3',
            quantity: 200,
            unit_price: 200.00,
            total_price: 40000.00,
        },
    });
    console.log('✅ Created 2 sales orders');

    // 12. Create Shipments
    const shipment1 = await prisma.sales_shipments.upsert({
        where: { id: 'ship-1' },
        update: {},
        create: {
            id: 'ship-1',
            shipment_number: 'SH-2025-001',
            customer_name: 'XYZ Trading Ltd.',
            shipping_address: '321 Commerce Street, Bangkok 10400',
            status: 'shipped',
            shipment_date: new Date('2025-11-26'),
            tracking_number: 'TK-2025-001',
            notes: 'Handle with care',
            handled_by: 'user-admin-003',
            updated_at: new Date(),
        },
    });

    await prisma.shipment_items.upsert({
        where: { id: 'shi-1' },
        update: {},
        create: {
            id: 'shi-1',
            shipment_id: 'ship-1',
            product_id: 'prod-3',
            quantity: 200,
            unit_price: 200.00,
            total_price: 40000.00,
        },
    });
    console.log('✅ Created 1 shipment');

    // 13. Create Sales Returns
    const return1 = await prisma.sales_returns.upsert({
        where: { id: 'ret-1' },
        update: {},
        create: {
            id: 'ret-1',
            return_number: 'RT-2025-001',
            so_number: 'SO-2025-001',
            customer_name: 'ABC Corporation Co., Ltd.',
            return_date: new Date('2025-11-24'),
            status: 'approved',
            reason: 'Wrong specifications',
            total_amount: 1500.00,
            refund_method: 'Credit Note',
            notes: 'Customer requested different model',
            handled_by: 'user-admin-002',
        },
    });

    await prisma.return_items.upsert({
        where: { id: 'reti-1' },
        update: {},
        create: {
            id: 'reti-1',
            return_id: 'ret-1',
            product_id: 'prod-2',
            quantity: 5,
            unit_price: 300.00,
            total_price: 1500.00,
            condition: 'unopened',
        },
    });
    console.log('✅ Created 1 return');

    // 14. Create Notifications
    await Promise.all([
        prisma.notifications.upsert({
            where: { id: 'notif-1' },
            update: {},
            create: {
                id: 'notif-1',
                user_id: 'user-admin-001',
                title: 'New Purchase Requisition',
                message: 'PR PR-2025-003 created and pending your approval',
                type: 'approval',
                link: '/purchasing/requisition',
                is_read: false,
                created_at: new Date('2025-11-27'),
            },
        }),
        prisma.notifications.upsert({
            where: { id: 'notif-2' },
            update: {},
            create: {
                id: 'notif-2',
                user_id: 'user-admin-001',
                title: 'Low Stock Alert',
                message: 'Product Stapler Heavy Duty (OFF-002) is low on stock',
                type: 'warning',
                link: '/inventory/items',
                is_read: false,
                created_at: new Date('2025-11-26'),
            },
        }),
        prisma.notifications.upsert({
            where: { id: 'notif-3' },
            update: {},
            create: {
                id: 'notif-3',
                user_id: 'user-admin-002',
                title: 'New Sales Order',
                message: 'Sales Order SO-2025-002 created for XYZ Trading Ltd.',
                type: 'info',
                link: '/sales/orders',
                is_read: true,
                created_at: new Date('2025-11-25'),
            },
        }),
    ]);
    console.log('✅ Created 3 notifications');

    console.log('🎉 Full seed completed successfully!');
    console.log('📊 Summary:');
    console.log('   - 4 Users (3 admin, 1 regular)');
    console.log('   - 2 Categories');
    console.log('   - 2 Suppliers');
    console.log('   - 4 Products with prices');
    console.log('   - 3 PRs (2 approved, 1 pending)');
    console.log('   - 1 PO (sent)');
    console.log('   - 2 GRNs (completed)');
    console.log('   - 2 Adjustments');
    console.log('   - 2 Customers');
    console.log('   - 2 Sales Orders');
    console.log('   - 1 Shipment');
    console.log('   - 1 Return');
    console.log('   - 3 Notifications');
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
