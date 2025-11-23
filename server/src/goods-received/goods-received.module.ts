import { Module } from '@nestjs/common';
import { GoodsReceivedController } from './goods-received.controller';
import { GoodsReceivedService } from './goods-received.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoodsReceivedController],
  providers: [GoodsReceivedService]
})
export class GoodsReceivedModule { }
