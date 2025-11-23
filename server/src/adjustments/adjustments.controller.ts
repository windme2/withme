import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';

@Controller('adjustments')
export class AdjustmentsController {
    constructor(private readonly adjustmentsService: AdjustmentsService) { }

    @Get()
    findAll(@Query('type') type?: string, @Query('search') search?: string) {
        return this.adjustmentsService.findAll(type, search);
    }

    @Get('stats')
    getStats() {
        return this.adjustmentsService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adjustmentsService.findOne(id);
    }
    @Post()
    create(@Body() body: any) {
        // Mock user ID for now, in real app get from request/auth
        const userId = 'user-admin-001';
        return this.adjustmentsService.create({ ...body, userId });
    }
}
