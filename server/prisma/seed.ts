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
    const user = await prisma.users.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            id: 'user-1',
            email: 'admin@example.com',
            username: 'admin',
            password_hash: 'admin123', // Plain text for now as per AuthService logic
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            updated_at: new Date(),
        },
    });
    console.log({ user });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
