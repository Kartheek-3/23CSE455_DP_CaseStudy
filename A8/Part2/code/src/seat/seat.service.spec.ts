import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { SeatService } from './seat.service';
import { Seat } from './entities/seat.entity';
import { SeatClass } from './enums/seat-class.enum';

describe('SeatService', () => {
  let service: SeatService;
  let seatRepoMock: any;

  beforeEach(async () => {
    seatRepoMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn().mockImplementation((s: any) => Promise.resolve(s)),
      create: jest.fn().mockImplementation((s: any) => s),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatService,
        {
          provide: getRepositoryToken(Seat),
          useValue: seatRepoMock,
        },
      ],
    }).compile();

    service = module.get<SeatService>(SeatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSeat with SeatClass', () => {
    const mockBooking: any = { id: 'b1' };

    it('should successfully create a FIRST class seat in row 1..3', async () => {
      seatRepoMock.findOne.mockResolvedValue(null);

      const seat = await service.createSeat(
        1,
        2,
        'f1',
        mockBooking,
        SeatClass.FIRST,
      );

      expect(seat.seatClass).toBe(SeatClass.FIRST);
      expect(seat.isAvailable).toBe(false);
      expect(seatRepoMock.save).toHaveBeenCalled();
    });

    it('should successfully create a BUSINESS class seat in row 4..8', async () => {
      seatRepoMock.findOne.mockResolvedValue(null);

      const seat = await service.createSeat(
        3,
        5,
        'f1',
        mockBooking,
        SeatClass.BUSINESS,
      );

      expect(seat.seatClass).toBe(SeatClass.BUSINESS);
      expect(seat.isAvailable).toBe(false);
    });

    it('should successfully create an ECONOMY class seat in row 9..20', async () => {
      seatRepoMock.findOne.mockResolvedValue(null);

      const seat = await service.createSeat(
        4,
        15,
        'f1',
        mockBooking,
        SeatClass.ECONOMY,
      );

      expect(seat.seatClass).toBe(SeatClass.ECONOMY);
      expect(seat.isAvailable).toBe(false);
    });

    it('should auto-infer seat class from row if seatClass is not specified', async () => {
      seatRepoMock.findOne.mockResolvedValue(null);

      const firstSeat = await service.createSeat(1, 1, 'f1', mockBooking);
      expect(firstSeat.seatClass).toBe(SeatClass.FIRST);

      const businessSeat = await service.createSeat(2, 6, 'f1', mockBooking);
      expect(businessSeat.seatClass).toBe(SeatClass.BUSINESS);

      const economySeat = await service.createSeat(3, 12, 'f1', mockBooking);
      expect(economySeat.seatClass).toBe(SeatClass.ECONOMY);
    });

    it('should throw BadRequestException when row number does not match requested class', async () => {
      seatRepoMock.findOne.mockResolvedValue(null);

      // Row 10 is not FIRST class
      await expect(
        service.createSeat(1, 10, 'f1', mockBooking, SeatClass.FIRST),
      ).rejects.toThrow(BadRequestException);

      // Row 2 is not BUSINESS class
      await expect(
        service.createSeat(1, 2, 'f1', mockBooking, SeatClass.BUSINESS),
      ).rejects.toThrow(BadRequestException);

      // Row 3 is not ECONOMY class
      await expect(
        service.createSeat(1, 3, 'f1', mockBooking, SeatClass.ECONOMY),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if seat is already booked', async () => {
      seatRepoMock.findOne.mockResolvedValue({ id: 'existing-seat' });

      await expect(
        service.createSeat(1, 2, 'f1', mockBooking, SeatClass.FIRST),
      ).rejects.toThrow('There is a seat booked with the provided credentials!');
    });

    it('should throw BadRequestException for invalid seat or row numbers', async () => {
      await expect(
        service.createSeat(-1, 5, 'f1', mockBooking),
      ).rejects.toThrow('The seat no must be between 1 and 6');

      await expect(
        service.createSeat(7, 5, 'f1', mockBooking),
      ).rejects.toThrow('The seat no must be between 1 and 6');

      await expect(
        service.createSeat(1, 25, 'f1', mockBooking),
      ).rejects.toThrow('The row no must be between 1 and 20');
    });
    it('should infer FIRST class when seatClass is omitted and row is 2', async () => {
      seatRepoMock.findOne.mockResolvedValue(null);
      const seat = await service.createSeat(1, 2, 'f1', mockBooking);
      expect(seat.seatClass).toBe(SeatClass.FIRST);
    });

    it('should infer BUSINESS class when seatClass is omitted and row is 5', async () => {
      seatRepoMock.findOne.mockResolvedValue(null);
      const seat = await service.createSeat(1, 5, 'f1', mockBooking);
      expect(seat.seatClass).toBe(SeatClass.BUSINESS);
    });

    it('should infer ECONOMY class when seatClass is omitted and row is 10', async () => {
      seatRepoMock.findOne.mockResolvedValue(null);
      const seat = await service.createSeat(1, 10, 'f1', mockBooking);
      expect(seat.seatClass).toBe(SeatClass.ECONOMY);
    });
  });
});