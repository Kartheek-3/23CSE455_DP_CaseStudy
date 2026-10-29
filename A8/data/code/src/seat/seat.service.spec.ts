import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SeatService } from './seat.service';
import { Seat } from './entities/seat.entity';

describe('SeatService', () => {
  let service: SeatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatService,
        {
          provide: getRepositoryToken(Seat),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SeatService>(SeatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});