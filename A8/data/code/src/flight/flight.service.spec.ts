import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FlightService } from './flight.service';
import { Flight } from './entities/flight.entity';

describe('FlightService', () => {
  let service: FlightService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightService,
        {
          provide: getRepositoryToken(Flight),
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

    service = module.get<FlightService>(FlightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});