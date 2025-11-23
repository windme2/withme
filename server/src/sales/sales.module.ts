import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesShipmentsService } from './sales-shipments.service';
import { SalesShipmentsController } from './sales-shipments.controller';
import { SalesReturnsService } from './sales-returns.service';
import { SalesReturnsController } from './sales-returns.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SalesOrdersController, SalesShipmentsController, SalesReturnsController],
    providers: [SalesOrdersService, SalesShipmentsService, SalesReturnsService],
})
export class SalesModule { }
