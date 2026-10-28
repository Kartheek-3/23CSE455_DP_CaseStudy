import nodemailer from "nodemailer";
import { injectable } from "tsyringe";

@injectable()
export class EmailService {
  private _transporter;

  constructor() {
    this._transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    console.log(process.env.EMAIL_USER,process.env.EMAIL_PASS)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your One-Time Password (OTP)",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; padding: 10px; background-color: #f8f9fa; margin-bottom: 20px;">
            <h1 style="color: #333; margin: 0;">Verification Code</h1>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Hello,</p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for using our service. Please use the following verification code to complete your action:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 30px; background-color: #f2f2f2; border-radius: 5px; letter-spacing: 5px; font-size: 24px; font-weight: bold;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">This code will expire in 10 minutes for security reasons.</p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">If you didn't request this code, please ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 14px;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };
    
    try {
      await this._transporter.sendMail(mailOptions);
    } catch (error: any) {
      console.error("Nodemailer OTP Error: ", error);
      // In development, log the OTP regardless so progress is possible
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Fallback OTP for ${email}: ${otp}`);
      }
      throw error;
    }
  }

  async sendForgotPasswordLink(email: string, link: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; padding: 10px; background-color: #f8f9fa; margin-bottom: 20px;">
            <h1 style="color: #333; margin: 0;">Reset Your Password</h1>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">Hello,</p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5;">This link will expire in 10 minute for security reasons. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          
          <p style="color: #777; font-size: 14px; margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; font-size: 14px; color: #4285f4; margin-bottom: 30px;">${link}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 14px;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };
    

    await this._transporter.sendMail(mailOptions);
  }
}