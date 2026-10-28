import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SendGrid from '@sendgrid/mail';
import { Queue } from 'bullmq';

@Injectable()
export class SendGridService {
  private readonly logger = new Logger(SendGridService.name);
  private readonly sendGridEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {
    const apiKey = this.configService.get<string>('SEND_GRID_API_KEY');

    if (apiKey) {
      SendGrid.setApiKey(apiKey);
      this.sendGridEnabled = true;
      this.logger.log('SendGrid email service enabled.');
    } else {
      this.sendGridEnabled = false;
      this.logger.warn(
        'SEND_GRID_API_KEY not configured. Email sending is disabled.',
      );
    }
  }

  async send(mail: SendGrid.MailDataRequired) {
    if (!this.sendGridEnabled) {
      this.logger.warn(
        `Email skipped because SendGrid is not configured. Subject: ${mail.subject}`,
      );
      return;
    }

    console.log(mail);

    // Sending mail takes time and resources, so schedule it using BullMQ.
    await this.emailQueue.add('sending-token-sendGrid', mail);
  }
}