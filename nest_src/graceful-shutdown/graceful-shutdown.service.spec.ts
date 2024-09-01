import { Test, TestingModule } from '@nestjs/testing';
import { GracefulShutdownService } from './graceful-shutdown.service';

describe('GracefulShutdownService', () => {
  let service: GracefulShutdownService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GracefulShutdownService],
    }).compile();

    service = module.get<GracefulShutdownService>(GracefulShutdownService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
