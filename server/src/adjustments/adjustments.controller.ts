import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    @UseGuards(JwtAuthGuard)
    create(@Body() body: any, @Request() req: any) {
        return this.adjustmentsService.create({ ...body, userId: req.user.id });
    }
}
