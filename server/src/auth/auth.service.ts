import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user by email or username
        const user = await this.prisma.users.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ]
            }
        });

        if (!user) {
            console.log('❌ User not found for:', email);
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log('✅ User found:', user.username);
        console.log('📝 Password in DB:', user.password_hash);
        console.log('📝 Password provided:', password);
        console.log('🔍 Match:', user.password_hash === password);

        // Simple password check (plain text for development)
        // In production, use bcrypt.compare(password, user.password_hash)
        if (user.password_hash !== password) {
            console.log('❌ Password mismatch!');
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log('✅ Login successful!');

        return {
            user: {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role,
            },
            token: 'mock-jwt-token' // Replace with real JWT later
        };
    }
}
