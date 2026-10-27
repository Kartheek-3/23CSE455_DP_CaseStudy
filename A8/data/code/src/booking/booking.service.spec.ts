import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Flight } from '../flight/entities/flight.entity';
import { Seat } from '../seat/entities/seat.entity';

describe('BookingService', () => {
  let service: BookingService;

  const repositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,

        {
          provide: getRepositoryToken(Booking),
          useValue: repositoryMock,
        },

        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },

        {
          provide: getRepositoryToken(Flight),
          useValue: repositoryMock,
        },

        {
          provide: getRepositoryToken(Seat),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});