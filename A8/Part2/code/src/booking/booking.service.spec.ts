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
        {
          provide: 'SeatService',
          useValue: {
            createSeat: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBooking', () => {
    it('should throw BadRequestException when trying to book a cancelled flight', async () => {
      const userRepoMock = repositoryMock;

      // Mock user and flight
      userRepoMock.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 'u1') return Promise.resolve({ id: 'u1' });
        if (where?.id === 'f1') {
          return Promise.resolve({
            id: 'f1',
            status: 'CANCELLED',
          });
        }
        return Promise.resolve(null);
      });

      await expect(service.createBooking('u1', 'f1')).rejects.toThrow(
        'Cannot book seats on a cancelled flight',
      );
    });
  });

  describe('modifyBooking', () => {
    it('should successfully modify seat and seatClass on the same flight', async () => {
      const mockBooking: any = {
        id: 'b1',
        userId: 'u1',
        flightId: 'f1',
        flight: { id: 'f1', status: 'ACTIVE', availableSeats: 50 },
        seat: [{ id: 's1', seatNo: 1, rowNo: 15, seatClass: 'ECONOMY' }],
      };

      repositoryMock.findOne.mockResolvedValue(mockBooking);
      repositoryMock.save.mockImplementation((entity: any) =>
        Promise.resolve(entity),
      );
      repositoryMock.delete.mockResolvedValue({ affected: 1 });
      repositoryMock.create.mockImplementation((s: any) => ({
        id: 's2',
        ...s,
      }));

      const result = await service.modifyBooking('u1', {
        bookingId: 'b1',
        seats: [{ seatNo: 2, rowNo: 2, flightId: 'f1', seatClass: 'FIRST' as any }],
      });

      expect(result).toBeDefined();
      expect(repositoryMock.save).toHaveBeenCalled();
      expect(result.seat[0].seatClass).toBe('FIRST');
    });

    it('should successfully transfer booking to a new flight and update seat availability', async () => {
      const mockOldFlight: any = { id: 'f1', status: 'ACTIVE', availableSeats: 10 };
      const mockNewFlight: any = { id: 'f2', status: 'ACTIVE', availableSeats: 20 };
      const mockBooking: any = {
        id: 'b1',
        userId: 'u1',
        flightId: 'f1',
        flight: mockOldFlight,
        seat: [{ id: 's1', seatNo: 1, rowNo: 10 }],
      };

      repositoryMock.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 'b1') return Promise.resolve(mockBooking);
        if (where?.id === 'f2') return Promise.resolve(mockNewFlight);
        return Promise.resolve(null);
      });
      repositoryMock.save.mockImplementation((entity: any) =>
        Promise.resolve(entity),
      );
      repositoryMock.delete.mockResolvedValue({ affected: 1 });
      repositoryMock.create.mockImplementation((s: any) => ({
        id: 's2',
        ...s,
      }));

      const result = await service.modifyBooking('u1', {
        bookingId: 'b1',
        flightId: 'f2',
        seats: [{ seatNo: 1, rowNo: 5, flightId: 'f2' }],
      });

      expect(result.flightId).toBe('f2');
      expect(mockOldFlight.availableSeats).toBe(11);
      expect(mockNewFlight.availableSeats).toBe(19);
    });

    it('should throw BadRequestException when modifying a booking on a cancelled flight', async () => {
      const mockBooking: any = {
        id: 'b1',
        userId: 'u1',
        flightId: 'f1',
        flight: { id: 'f1', status: 'CANCELLED' },
        seat: [],
      };

      repositoryMock.findOne.mockResolvedValue(mockBooking);

      await expect(
        service.modifyBooking('u1', { bookingId: 'b1' }),
      ).rejects.toThrow('Cannot modify a booking for a cancelled flight');
    });

    it('should throw BadRequestException when transferring to a cancelled flight', async () => {
      const mockBooking: any = {
        id: 'b1',
        userId: 'u1',
        flightId: 'f1',
        flight: { id: 'f1', status: 'ACTIVE' },
        seat: [{ id: 's1' }],
      };

      repositoryMock.findOne.mockImplementation(({ where }: any) => {
        if (where?.id === 'b1') return Promise.resolve(mockBooking);
        if (where?.id === 'f-cancelled') {
          return Promise.resolve({ id: 'f-cancelled', status: 'CANCELLED', availableSeats: 50 });
        }
        return Promise.resolve(null);
      });

      await expect(
        service.modifyBooking('u1', {
          bookingId: 'b1',
          flightId: 'f-cancelled',
        }),
      ).rejects.toThrow('Cannot transfer booking to a cancelled flight');
    });

    it('should throw UnauthorizedException when user does not own the booking', async () => {
      const mockBooking: any = {
        id: 'b1',
        userId: 'u-other',
        user: { id: 'u-other' },
      };

      repositoryMock.findOne.mockResolvedValue(mockBooking);

      await expect(
        service.modifyBooking('u1', { bookingId: 'b1' }),
      ).rejects.toThrow('There is no booking with the provided id or it belongs to a different user!');
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.modifyBooking('u1', { bookingId: 'b-nonexistent' }),
      ).rejects.toThrow('There is no booking with the provided id');
    });
  });
});