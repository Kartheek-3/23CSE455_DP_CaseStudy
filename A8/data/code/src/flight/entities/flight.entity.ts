import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Booking } from 'src/booking/entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Flight {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => Int)
  flightNumber: number;

  @Column({ type: 'varchar' })
  @Field(() => String)
  departureAirport: string;

  @Column({ type: 'varchar' })
  @Field(() => String)
  destinationAirport: string;

  @Field(() => String)
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  @Field(() => String)
  departureTime: string;

  @Column({ type: 'time' })
  @Field(() => String)
  arrivalTime: string;

  @Column({ type: 'varchar' })
  @Field(() => String)
  airLine: string;

  @Column({ nullable: false, default: 60 })
  @Field(() => Int, { nullable: false, defaultValue: 60 })
  availableSeats: number;

  // Relation must not have colum decorator the oneToMany or manyToOne Is Sufficient
  @ManyToOne(() => User, (user) => user.ResponsibleFlights, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Field(() => User, { nullable: true })
  responsibleBy?: User | null;

  // For the passenger Booked Flights
  @Field(() => [Booking], { nullable: true })
  @OneToMany(() => Booking, (booking) => booking.flight, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  bookings?: Booking[];
}
