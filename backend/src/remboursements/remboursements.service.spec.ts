import { Test, TestingModule } from '@nestjs/testing';
import { RemboursementsService } from './remboursements.service';

describe('RemboursementsService', () => {
  let service: RemboursementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemboursementsService],
    }).compile();

    service = module.get<RemboursementsService>(RemboursementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
