import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const users = await this.prisma.users.findMany({
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                department: true,
                is_active: true,
                last_login_at: true,
                created_at: true,
            }
        });
        return users;
    }

    async findOne(id: string) {
        const user = await this.prisma.users.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                department: true,
                is_active: true,
                last_login_at: true,
                created_at: true,
            }
        });
        return user;
    }

    async update(id: string, data: any) {
        // Exclude password and sensitive fields from direct update for now
        // In a real app, handle password change separately with hashing
        const { password, ...updateData } = data;

        return this.prisma.users.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                department: true,
                is_active: true,
                updated_at: true,
            }
        });
    }
}
