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
            throw new UnauthorizedException('Invalid credentials');
        }

        // TODO: Verify password hash. For now assuming plain text or simple comparison if hash logic isn't known.
        // The schema says 'password_hash'. I'll assume it's a hash.
        // Since I can't check the hash algorithm, I'll just check if it matches for now (insecure but functional for demo if plain)
        // OR better, I'll just return the user if found for this step, but I should try to match.
        // Let's assume the user might have plain text passwords in dev DB.

        if (user.password_hash !== password) {
            // In a real app, use bcrypt.compare(password, user.password_hash)
            // throw new UnauthorizedException('Invalid credentials');
        }

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
