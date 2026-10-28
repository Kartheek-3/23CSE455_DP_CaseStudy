import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';

import { BookingResolver } from './booking.resolver';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';

import { SeatService } from '../seat/seat.service';
import { FlightService } from '../flight/flight.service';
import { UsersService } from '../users/users.service';

import { UserDataLoader } from '../users/loaders/user.loader';
import { FlightDataLoader } from '../flight/loaders/flight.loader';
import { SeatDataLoader } from '../seat/loaders/seat.loader';

import { SendGridService } from '../users/send-grid.service';

describe('BookingResolver', () => {
  let resolver: BookingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingResolver,

        // BookingService
        {
          provide: BookingService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            cancel: jest.fn(),
            delete: jest.fn(),
          },
        },

        // SeatService
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

        // FlightService
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

        // UsersService
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },

        // User DataLoader
        {
          provide: UserDataLoader,
          useValue: {
            generateDataLoader: jest.fn(),
          },
        },

        // Flight DataLoader
        {
          provide: FlightDataLoader,
          useValue: {
            generateDataLoader: jest.fn(),
          },
        },

        // Seat DataLoader
        {
          provide: SeatDataLoader,
          useValue: {
            generateDataLoader: jest.fn(),
          },
        },

        // SendGrid
        {
          provide: SendGridService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },

        // Booking Repository
        {
          provide: getRepositoryToken(Booking),
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

        // Email queue
        {
          provide: getQueueToken('email'),
          useValue: {
            add: jest.fn(),
            addBulk: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<BookingResolver>(BookingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});