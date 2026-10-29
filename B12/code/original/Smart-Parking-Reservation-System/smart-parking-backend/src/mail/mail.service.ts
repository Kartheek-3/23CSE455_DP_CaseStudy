import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendReservationConfirmation(
    email: string,
    name: string,
    slotNumber: string,
    location: string,
    startTime: Date,
    endTime: Date,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reservation Confirmed',
      template: './reservation-confirmed',
      context: { name, slotNumber, location, startTime, endTime },
    });
  }

  async sendReservationCancelled(
    email: string,
    name: string,
    slotNumber: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reservation Cancelled',
      template: './reservation-cancelled',
      context: { name, slotNumber },
    });
  }

  async sendPasswordResetEmail(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Code',
      template: './password-reset',
      context: { code },
    });
  }
}
