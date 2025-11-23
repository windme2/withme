import { Module } from '@nestjs/common';
import { AdjustmentsController } from './adjustments.controller';
import { AdjustmentsService } from './adjustments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdjustmentsController],
  providers: [AdjustmentsService]
})
export class AdjustmentsModule { }
