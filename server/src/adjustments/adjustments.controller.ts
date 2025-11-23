import { Controller, Get, Param, Query } from '@nestjs/common';
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
}
