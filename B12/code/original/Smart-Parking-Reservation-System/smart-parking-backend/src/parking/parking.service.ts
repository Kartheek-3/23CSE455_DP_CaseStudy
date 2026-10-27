import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ParkingArea } from './parking-area.entity';
import { CreateParkingAreaDto } from './dto/create-parking-area.dto';

@Injectable()
export class ParkingService {
  constructor(
    @InjectRepository(ParkingArea)
    private parkingRepository: Repository<ParkingArea>,
  ) {}

  async create(
    createParkingAreaDto: CreateParkingAreaDto,
  ): Promise<ParkingArea> {
    const parkingArea = this.parkingRepository.create(createParkingAreaDto);
    return this.parkingRepository.save(parkingArea);
  }

  async findAll(
    searchTerm?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: ParkingArea[];
    total: number;
    page: number;
    limit: number;
  }> {
    const where: any = {};
    if (searchTerm) {
      where.name = ILike(`%${searchTerm}%`);
    }

    const [data, total] = await this.parkingRepository.findAndCount({
      where,
      relations: ['slots'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async update(id: number, updateData: Partial<ParkingArea>) {
    await this.parkingRepository.update(id, updateData);
    return this.parkingRepository.findOne({
      where: { id },
      relations: ['slots'],
    });
  }

  async remove(id: number) {
    const area = await this.parkingRepository.findOne({ where: { id } });
    if (!area) throw new NotFoundException('Parking area not found');

    await this.parkingRepository.softDelete(id);
    return { message: 'Parking area deleted successfully' };
  }
}
