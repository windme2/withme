import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@Request() req: any) {
        // In a real app with JWT Guard, use req.user.id
        // For now, hardcode to the seeded admin user or get from header if passed
        const userId = 'user-admin-001';
        return this.usersService.findOne(userId);
    }

    @Put('me')
    async updateProfile(@Request() req: any, @Body() data: any) {
        const userId = 'user-admin-001';
        return this.usersService.update(userId, data);
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
}
