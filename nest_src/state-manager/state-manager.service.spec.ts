import { Test, TestingModule } from '@nestjs/testing';
import { StateManagerService } from './state-manager.service';

describe('StateManagerService', () => {
  let service: StateManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StateManagerService],
    }).compile();

    service = module.get<StateManagerService>(StateManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
