import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; // We will hash this later

  @Column()
  fullName!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  // One User -> Many Reservations
  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations!: Reservation[];

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  defaultVehicleNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordCode!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires!: Date | null;
}
