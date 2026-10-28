import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Flight } from 'src/flight/entities/flight.entity';
import { User } from 'src/users/entities/user.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Field(() => User)
  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.bookedFlights, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @Field(() => Flight)
  @JoinColumn({ name: 'flightId' })
  @ManyToOne(() => Flight, (flight) => flight.bookings, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  flight: Flight;

  // Foreign key column for DataLoader
  @Column()
  @Field()
  userId: string;

  @Column()
  @Field()
  flightId: string;

  @Column('uuid', { array: true, nullable: true })
  @Field(() => [String])
  seatId: string[];

  @OneToMany(() => Seat, (seat) => seat.booking, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'seatId' })
  seat: Seat[];

  @Field(() => Date)
  @Column({ default: new Date(Date.now()) })
  createdAt: Date;
}
