import { SMSService } from "../../application/services/MSService";
import twilio from "twilio";

console.log( process.env.TWILIO_PHONE_NUMBER);

export class TwilioSMSService implements SMSService {
  private client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  async sendSMS(to: string, message: string): Promise<void> {
    await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  }
}
