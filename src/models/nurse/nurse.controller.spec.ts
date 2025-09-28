import { Test, TestingModule } from '@nestjs/testing';
import { NurseController } from './nurse.controller';
import { NurseService } from './nurse.service';

describe('NurseController', () => {
  let controller: NurseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NurseController],
      providers: [NurseService],
    }).compile();

    controller = module.get<NurseController>(NurseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
