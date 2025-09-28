import { Test, TestingModule } from '@nestjs/testing';
import { NurseService } from './nurse.service';

describe('NurseService', () => {
  let service: NurseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NurseService],
    }).compile();

    service = module.get<NurseService>(NurseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
