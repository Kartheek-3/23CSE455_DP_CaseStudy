export interface RegistrationPayload {
  name: string;
  email: string;
  mobile: string;
  password?: string;
  referralCode?: string;
  otp: string;
  otpExpires: string | Date;
  status?: string;
  role?: string;
  isBlock?: boolean;
  aadhaarNumber?: string;
  licenseNumber?: string;
  referredBy?: string;
  referalPay?: boolean;
  [key: string]: unknown;
}
