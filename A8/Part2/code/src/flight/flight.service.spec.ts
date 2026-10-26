import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FlightService } from './flight.service';
import { Flight } from './entities/flight.entity';
import { FlightStatus } from './enums/flight-status.enum';
import { Seat } from 'src/seat/entities/seat.entity';
import { SendGridService } from 'src/users/send-grid.service';

describe('FlightService', () => {
  let service: FlightService;
  let flightRepoMock: any;
  let seatRepoMock: any;
  let sendGridMock: any;

  beforeEach(async () => {
    flightRepoMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };

    seatRepoMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    sendGridMock = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightService,
        {
          provide: getRepositoryToken(Flight),
          useValue: flightRepoMock,
        },
        {
          provide: getRepositoryToken(Seat),
          useValue: seatRepoMock,
        },
        {
          provide: SendGridService,
          useValue: sendGridMock,
        },
      ],
    }).compile();

    service = module.get<FlightService>(FlightService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cancelFlight', () => {
    it('should successfully cancel an active flight and release seats', async () => {
      const mockFlight: any = {
        id: 'f1',
        flightNumber: 101,
        status: FlightStatus.ACTIVE,
        availableSeats: 50,
        departureAirport: 'JFK',
        destinationAirport: 'LAX',
        bookings: [
          {
            id: 'b1',
            user: { email: 'passenger@example.com' },
            seat: [{ id: 's1', isAvailable: false }],
          },
        ],
      };

      flightRepoMock.findOne.mockResolvedValue(mockFlight);
      flightRepoMock.save.mockImplementation((f: any) => Promise.resolve(f));
      seatRepoMock.update.mockResolvedValue({ affected: 1 });

      const result = await service.cancelFlight('f1');

      expect(result.status).toBe(FlightStatus.CANCELLED);
      expect(result.availableSeats).toBe(0);
      expect(flightRepoMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: FlightStatus.CANCELLED,
          availableSeats: 0,
        }),
      );
      expect(seatRepoMock.update).toHaveBeenCalledWith(
        { flightId: 'f1' },
        { isAvailable: true },
      );
      expect(sendGridMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'passenger@example.com',
          subject: expect.stringContaining('101'),
        }),
      );
    });

    it('should throw NotFoundException if flight does not exist', async () => {
      flightRepoMock.findOne.mockResolvedValue(null);

      await expect(service.cancelFlight('f999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if flight is already cancelled', async () => {
      const mockFlight: any = {
        id: 'f1',
        status: FlightStatus.CANCELLED,
      };

      flightRepoMock.findOne.mockResolvedValue(mockFlight);

      await expect(service.cancelFlight('f1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});