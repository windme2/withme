import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    async findAll() {
        return this.inventoryService.findAll();
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: any) {
        return this.inventoryService.update(id, data);
    }
}
