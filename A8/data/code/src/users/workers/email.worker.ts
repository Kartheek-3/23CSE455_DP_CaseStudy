import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from '../users.service';
import SendGrid from '@sendgrid/mail';

// where the logic behind the scene is actually manipulated
// concurency determined the number of jobs that run in parallel
@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly userService: UsersService) {
    super();
  }

  async process(job: Job, token?: string): Promise<any> {
    if (job.name === 'sending-token-mailtrap')
      await this.userService.sendMail(job.data.token, job.data.email);
    else if (job.name === 'sending-token-sendGrid') {
      // console.log(job.data);
      const mailData = job.data as SendGrid.MailDataRequired;
      const transport = await SendGrid.send(mailData);
      console.log(`E-Mail sent to ${mailData.to}`);
      return transport;
    }
    console.log('got a new job', job.id);
  }

  @OnWorkerEvent('active')
  onAdded(job: Job) {
    console.log('got a new job', job.id);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`job with id of ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    console.log(`job with id of ${job.id} failed`);
  }
}
