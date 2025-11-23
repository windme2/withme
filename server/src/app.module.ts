import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InventoryModule } from './inventory/inventory.module';
import { GoodsReceivedModule } from './goods-received/goods-received.module';
import { AdjustmentsModule } from './adjustments/adjustments.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PurchasingModule } from './purchasing/purchasing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    InventoryModule,
    GoodsReceivedModule,
    AdjustmentsModule,
    SuppliersModule,
    DashboardModule,
    TransactionsModule,
    PurchasingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

