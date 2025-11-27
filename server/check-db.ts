import { PrismaClient } from './generated/client/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const order = await prisma.sales_orders.findUnique({
        where: { so_number: 'SO-2025-628' } // I need to be careful with the ID, I'll use findFirst if I'm not sure of the exact number, but I saw it in the logs
    });
    // Actually, let's find the latest order
    const latestOrder = await prisma.sales_orders.findFirst({
        orderBy: { created_at: 'desc' },
        include: { sales_order_items: true }
    });
    console.log('Latest Order:', JSON.stringify(latestOrder, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
