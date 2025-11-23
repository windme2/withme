import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivedController } from './goods-received.controller';

describe('GoodsReceivedController', () => {
  let controller: GoodsReceivedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsReceivedController],
    }).compile();

    controller = module.get<GoodsReceivedController>(GoodsReceivedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
