import { Controller, Get, Post, Body, Query, Param, Patch } from '@nestjs/common';
import { PurchasingService } from './purchasing.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('purchasing/requisitions')
export class PurchasingController {
    constructor(private readonly purchasingService: PurchasingService) { }

    @Get()
    @Roles('admin', 'purchasing', 'inventory')
    findAll(@Query('status') status?: string, @Query('search') search?: string) {
        return this.purchasingService.findAll(status, search);
    }

    @Get(':id')
    @Roles('admin', 'purchasing', 'inventory')
    findOne(@Param('id') id: string) {
        return this.purchasingService.findOne(id);
    }

    @Post()
    @Roles('admin', 'purchasing')
    create(@Body() createDto: any, @CurrentUser('id') userId: string) {
        return this.purchasingService.create({ ...createDto, userId });
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string; supplierId?: string; approverId?: string }
    ) {
        // approverId must be provided by client (from auth) — server will validate role
        return this.purchasingService.updateStatus(id, body.status, body.approverId, body.supplierId);
    }
}
