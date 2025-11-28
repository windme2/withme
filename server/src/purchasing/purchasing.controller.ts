import { Controller, Get, Post, Body, Query, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchasing/requisitions')
export class PurchasingController {
    constructor(private readonly purchasingService: PurchasingService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
        return this.purchasingService.findAll(status, search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchasingService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createDto: any, @Request() req: any) {
        return this.purchasingService.create({ ...createDto, userId: req.user.id });
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.purchasingService.updateStatus(id, status);
    }
}
