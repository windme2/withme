import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

    async create(data: any) {
        const { email, username, password, first_name, last_name, role, department } = data;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.users.create({
            data: {
                id: `user-${Date.now()}`,
                email,
                username,
                password_hash: hashedPassword,
                first_name,
                last_name,
                role: role || 'staff',
                department: department || '',
                is_active: true,
                updated_at: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                department: true,
                is_active: true,
                created_at: true,
            }
        });

        return user;
    }

    async update(id: string, data: any) {
        const { password, ...updateData } = data;

        return this.prisma.users.update({
            where: { id },
            data: {
                ...updateData,
                updated_at: new Date(),
            },
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

    async deactivate(id: string) {
        return this.prisma.users.update({
            where: { id },
            data: {
                is_active: false,
                updated_at: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                is_active: true,
            }
        });
    }

    async resetPassword(id: string, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        return this.prisma.users.update({
            where: { id },
            data: {
                password_hash: hashedPassword,
                updated_at: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
            }
        });
    }
}
