import { Test, TestingModule } from '@nestjs/testing';
import { SeatResolver } from './seat.resolver';
import { SeatService } from './seat.service';

describe('SeatResolver', () => {
  let resolver: SeatResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatResolver,
        {
          provide: SeatService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<SeatResolver>(SeatResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});