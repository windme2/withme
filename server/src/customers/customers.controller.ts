import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    findAll(@Query('search') search?: string, @Query('isActive') isActive?: string) {
        return this.customersService.findAll(search, isActive);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Post()
    create(@Body() createDto: any) {
        return this.customersService.create(createDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.customersService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.customersService.delete(id);
    }
}
