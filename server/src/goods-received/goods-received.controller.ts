import { Controller, Get, Param, Query } from '@nestjs/common';
import { GoodsReceivedService } from './goods-received.service';

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
}
