import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { FlightResolver } from './flight.resolver';
import { FlightService } from './flight.service';
import { StaffService } from './staff.service';

describe('FlightResolver', () => {
  let resolver: FlightResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightResolver,
        {
  provide: UsersService,
  useValue: {
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
},
        {
          provide: FlightService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: StaffService,
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

    resolver = module.get<FlightResolver>(FlightResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});