import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Slot, SlotStatus } from './slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { ParkingArea } from '../parking/parking-area.entity';
import {
  Reservation,
  ReservationStatus,
} from '../reservations/reservation.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private slotsRepository: Repository<Slot>,

    @InjectRepository(ParkingArea)
    private parkingAreasRepository: Repository<ParkingArea>,

    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,

    private mailService: MailService,
  ) {}

  async create(createSlotDto: CreateSlotDto): Promise<Slot> {
    const parkingArea = await this.parkingAreasRepository.findOneBy({
      id: createSlotDto.parkingAreaId,
    });

    if (!parkingArea) {
      throw new NotFoundException(
        `Parking area ${createSlotDto.parkingAreaId} not found`,
      );
    }

    const slot = this.slotsRepository.create({
      slotNumber: createSlotDto.slotNumber,
      section: createSlotDto.section,
      type: createSlotDto.type,
      parkingArea,
      floor: createSlotDto.floor,
      pricePerHour: createSlotDto.pricePerHour,
    });
    return this.slotsRepository.save(slot);
  }

  async findAll(parkingAreaId?: number, status?: SlotStatus): Promise<Slot[]> {
    await this.expireOverdueReservations();
    const where: any = {};
    if (parkingAreaId) {
      where.parkingArea = { id: parkingAreaId };
    }
    if (status) {
      where.status = status;
    }
    return this.slotsRepository.find({
      where,
      relations: ['parkingArea'],
      order: { slotNumber: 'ASC' },
    });
  }

  private async expireOverdueReservations() {
    const now = new Date();

    const completed = await this.reservationsRepository.find({
      where: {
        status: ReservationStatus.ACTIVE,
        endTime: LessThan(now),
      },
      relations: ['slot'],
    });

    for (const reservation of completed) {
      reservation.status = ReservationStatus.COMPLETED;
      await this.reservationsRepository.save(reservation);
      await this.slotsRepository.update(reservation.slot.id, {
        status: SlotStatus.AVAILABLE,
      });
    }

    const noShows = await this.reservationsRepository.find({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: LessThan(now),
      },
      relations: ['slot'],
    });

    for (const reservation of noShows) {
      reservation.status = ReservationStatus.EXPIRED;
      await this.reservationsRepository.save(reservation);
      await this.slotsRepository.update(reservation.slot.id, {
        status: SlotStatus.AVAILABLE,
      });
    }
  }

  async update(id: number, updateData: UpdateSlotDto) {
    const slot = await this.slotsRepository.findOne({
      where: { id },
      relations: ['parkingArea'],
    });
    if (!slot) throw new NotFoundException('Slot not found');

    if (updateData.slotNumber !== undefined)
      slot.slotNumber = updateData.slotNumber;
    if (updateData.section !== undefined) slot.section = updateData.section;
    if (updateData.type !== undefined) slot.type = updateData.type;
    if (updateData.status !== undefined) slot.status = updateData.status;
    if (updateData.floor !== undefined) slot.floor = updateData.floor;
    if (updateData.pricePerHour !== undefined)
      slot.pricePerHour = updateData.pricePerHour;
    if (updateData.parkingAreaId !== undefined) {
      const area = await this.parkingAreasRepository.findOneBy({
        id: updateData.parkingAreaId,
      });
      if (!area)
        throw new NotFoundException(
          `Parking area ${updateData.parkingAreaId} not found`,
        );
      slot.parkingArea = area;
    }

    if (updateData.status === SlotStatus.AVAILABLE) {
      const reservation = await this.reservationsRepository.findOne({
        where: { slot: { id }, status: ReservationStatus.ACTIVE },
        relations: ['user', 'slot'],
      });

      if (reservation) {
        reservation.status = ReservationStatus.CANCELLED;
        await this.reservationsRepository.save(reservation);

        this.mailService
          .sendReservationCancelled(
            reservation.user.email,
            reservation.user.fullName,
            reservation.slot.slotNumber,
          )
          .catch((err) =>
            console.error('Failed to send cancellation email', err),
          );
      }
    }

    await this.slotsRepository.save(slot);
    return this.slotsRepository.findOne({
      where: { id },
      relations: ['parkingArea'],
    });
  }

  async remove(id: number) {
    const slot = await this.slotsRepository.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Slot not found');

    await this.slotsRepository.softDelete(id);
    return { message: 'Slot deleted successfully' };
  }

  async findAvailableByParkingArea(
    parkingAreaId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<Slot[]> {
    await this.expireOverdueReservations();
    const allSlots = await this.slotsRepository.find({
      where: { parkingArea: { id: parkingAreaId } },
      relations: ['parkingArea'],
    });

    const overlappingSlots = await this.reservationsRepository.find({
      where: {
        slot: { parkingArea: { id: parkingAreaId } },
        status: ReservationStatus.ACTIVE,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
      relations: ['slot'],
    });

    const busySlotIds = new Set(overlappingSlots.map((r) => r.slot.id));
    return allSlots.filter(
      (slot) =>
        !busySlotIds.has(slot.id) && slot.status !== SlotStatus.OCCUPIED,
    );
  }
}
