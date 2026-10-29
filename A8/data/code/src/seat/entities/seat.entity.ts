import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';

@ObjectType()
@Entity()
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Field()
  seatNo: number;

  @Column({ default: true })
  @Field({ defaultValue: true })
  isAvailable: Boolean;

  @Column()
  @Field()
  rowNo: number;

  @Column()
  @Field()
  flightId: string;

  @ManyToOne(() => Booking, (booking) => booking.seat, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  booking: Booking;
}
