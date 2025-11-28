import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@Request() req: any) {
        return this.usersService.findOne(req.user.id);
    }

    @Put('me')
    async updateProfile(@Request() req: any, @Body() data: any) {
        return this.usersService.update(req.user.id, data);
    }

    @Get()
    @Roles('admin')
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles('admin')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles('admin')
    async create(@Body() createDto: any) {
        return this.usersService.create(createDto);
    }

    @Put(':id')
    @Roles('admin')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        return this.usersService.update(id, updateDto);
    }

    @Delete(':id')
    @Roles('admin')
    async deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(id);
    }

    @Patch(':id/reset-password')
    @Roles('admin')
    async resetPassword(@Param('id') id: string, @Body() body: { password: string }) {
        return this.usersService.resetPassword(id, body.password);
    }
}
