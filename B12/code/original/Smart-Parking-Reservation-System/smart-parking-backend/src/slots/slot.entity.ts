import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ParkingArea } from '../parking/parking-area.entity';
import { Reservation } from '../reservations/reservation.entity';

export enum SlotStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
}

export enum SlotType {
  STANDARD = 'standard',
  EV = 'ev',
}

@Entity('slots')
export class Slot {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  slotNumber!: string;

  @Column({ type: 'varchar', nullable: true })
  section?: string;

  @Column({ type: 'enum', enum: SlotType, default: SlotType.STANDARD })
  type!: SlotType;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.AVAILABLE })
  status!: SlotStatus;

  @Column({ type: 'int', nullable: true, default: 0 })
  floor?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerHour?: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => ParkingArea, (parkingArea) => parkingArea.slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parkingAreaId' })
  parkingArea!: ParkingArea;

  @OneToMany(() => Reservation, (reservation) => reservation.slot)
  reservations!: Reservation[];
}
