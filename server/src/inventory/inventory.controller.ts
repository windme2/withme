import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    @Roles('admin', 'inventory', 'purchasing', 'sales')
    async findAll() {
        return this.inventoryService.findAll();
    }

    @Put(':id')
    @Roles('admin', 'inventory')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.inventoryService.update(id, data);
    }
}
