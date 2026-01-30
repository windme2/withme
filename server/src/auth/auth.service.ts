import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user by email or username
        const user = await this.prisma.users.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: email }
                ],
                is_active: true, // Only allow active users
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Compare password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT tokens
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
        
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
            expiresIn: '30d',
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: `${user.first_name} ${user.last_name}`,
                role: user.role,
                department: user.department,
            },
            accessToken,
            refreshToken,
            expiresIn: '7d',
        };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.users.findUnique({
            where: { id: userId, is_active: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
            });

            const user = await this.validateUser(payload.sub);

            const newPayload = {
                sub: user.id,
                email: user.email,
                role: user.role,
            };

            const newAccessToken = this.jwtService.sign(newPayload, {
                expiresIn: '7d',
            });

            return {
                accessToken: newAccessToken,
                expiresIn: '7d',
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
}
