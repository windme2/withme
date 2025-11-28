import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { GoodsReceivedService } from './goods-received.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('goods-received')
export class GoodsReceivedController {
    constructor(private readonly goodsReceivedService: GoodsReceivedService) { }

    @Get()
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
        return this.goodsReceivedService.findAll(status, search);
    }

    @Get('stats')
    getStats() {
        return this.goodsReceivedService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.goodsReceivedService.findOne(id);
    }
    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() body: any, @Request() req: any) {
        return this.goodsReceivedService.create({ ...body, userId: req.user.id });
    }
}
