import { Test, TestingModule } from '@nestjs/testing';
import { RemboursementsController } from './remboursements.controller';

describe('RemboursementsController', () => {
  let controller: RemboursementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemboursementsController],
    }).compile();

    controller = module.get<RemboursementsController>(RemboursementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
