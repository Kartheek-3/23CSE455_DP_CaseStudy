import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MinLength, ValidateIf } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enums/roles';
import { Flight } from 'src/flight/entities/flight.entity';
import { Booking } from 'src/booking/entities/booking.entity';

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @Field(() => Role)
  role: Role;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Column()
  @Field(() => String)
  email: string;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  password: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  passwordResetTokenExpirationDate: Date | null;

  // additional details for passenger
  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  passportId: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  nationality: string | null;

  // Additional details for stuff
  @Column({ type: 'varchar', nullable: true })
  @Field(() => String, { nullable: true })
  employeeID: string | null;

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean, { defaultValue: false })
  approved: Boolean;

  // For Admin Assign Flights for staff
  @Field(() => [Flight], { nullable: true })
  @OneToMany(() => Flight, (flight) => flight.responsibleBy, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  ResponsibleFlights?: Flight[];

  // for passenger booked flights
  @Field(() => [Booking], { nullable: true })
  @OneToMany(() => Booking, (booking) => booking.user, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  bookedFlights?: Booking[];
}
