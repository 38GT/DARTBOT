import { Test, TestingModule } from '@nestjs/testing';
import { PublishingService } from './publishing.service';

describe('PublishingService', () => {
  let service: PublishingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublishingService],
    }).compile();

    service = module.get<PublishingService>(PublishingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
