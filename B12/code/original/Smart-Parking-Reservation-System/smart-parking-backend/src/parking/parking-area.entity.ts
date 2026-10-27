import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Slot } from '../slots/slot.entity';

@Entity('parking_areas')
export class ParkingArea {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column()
  location!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePerHour!: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Slot, (slot) => slot.parkingArea)
  slots!: Slot[];
}
