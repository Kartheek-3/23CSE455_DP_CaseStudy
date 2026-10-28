import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Slot } from '../slots/slot.entity';

export enum ReservationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum VehicleType {
  TWO_WHEELER = 'two_wheeler',
  FOUR_WHEELER = 'four_wheeler',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'timestamp', nullable: true })
  startTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime!: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status!: ReservationStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vehicleNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalPrice?: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.FOUR_WHEELER,
  })
  vehicleType!: VehicleType;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Slot, (slot) => slot.reservations, { onDelete: 'CASCADE' })
  slot!: Slot;
}
