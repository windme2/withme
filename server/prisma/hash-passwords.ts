import { PrismaClient } from '../generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashExistingPasswords() {
    console.log('🔐 Hashing existing passwords...');

    // Get all users
    const users = await prisma.users.findMany();

    for (const user of users) {
        // Check if password is already hashed (bcrypt hashes start with $2b$)
        if (!user.password_hash.startsWith('$2b$')) {
            console.log(`🔄 Hashing password for user: ${user.username}`);
            const hashedPassword = await bcrypt.hash(user.password_hash, 10);
            
            await prisma.users.update({
                where: { id: user.id },
                data: { password_hash: hashedPassword },
            });
            
            console.log(`✅ Password hashed for user: ${user.username}`);
        } else {
            console.log(`⏭️  Password already hashed for user: ${user.username}`);
        }
    }

    console.log('✅ All passwords have been hashed!');
}

hashExistingPasswords()
    .catch((e) => {
        console.error('❌ Error hashing passwords:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
