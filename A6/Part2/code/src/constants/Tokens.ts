
export const TOKENS = {
  EMAIL_SERVICE:Symbol.for("EmailService"),
  WALLET_SERVICE:Symbol.for("WalletService"),
  PAYMENT_SERVICE:Symbol.for('StripePaymentService'),
  GOOGLE_DISTANCE_SERVICE:Symbol.for("GoogleDistanceService"),
  HASH_SERVICE:Symbol.for("HashService"),
 STRIPE_SERVICE:Symbol.for('StripeService'),
  REFERAL_CODE_SERVICE:Symbol.for("ReferralCodeService"),
  IFARE_CALCULATE_SERVICE:Symbol.for("IFareCalculatorService"),
  USER_REGISTERSTORE:Symbol.for("UserRegistrationStore"),
 NOTIFICATION_SERVICE:Symbol.for("INotificationService"),
 FILE_SERVICE:Symbol.for("IFileStorageService"),
 STRIPE_PAYMENT_SERVICE:Symbol.for("StripePaymentService"),
  IUSER_REPO:Symbol.for("IUserRepository"),
  VEHICLE_REPO:Symbol.for("IVehicleRepository"),
  WALLET_REPO:Symbol.for("IWalletRepository"),
  IDRIVER_REPO:Symbol.for("IDriverRepository"),
  IBOOKING_REPO:Symbol.for("IBookingRepository"),
  DRIVER_REVIEW_REPO:Symbol.for('DriverReviewRepository'),
  CHAT_REPO:Symbol.for('IChatRepository'),
 
  REGISTER_USER_USECASE:Symbol.for("RegisterUseCase"),
  GET_USER_DATA_USECASE:Symbol.for('GET_USER_DATA_USECASE'),
  VERIFY_OTP_USECAE:Symbol.for("VERIFY_OTP"),
  RESEND_OTP_USECASE:Symbol.for('RESEND_OTP_USECASE'),
  ADD_VEHICLE_USECASE:Symbol.for('ADD_VEHICLE_USECASE'),
  LOGIN_USECASE:Symbol.for('LOGIN_USECASE'),
  EDIT_VEHICLE_USECASE:Symbol.for('EDIT_VEHICLE_USECASE'),
  GET_VEHICLES_BY_USER_USECASE:Symbol.for('GET_VEHICLES_BY_USER_USECASE'),
  UPDATE_USER_USECASE: Symbol.for("UPDATE_USER_USECASE"),
 
  CREATE_PAYMENT_INTENT_USECASE:Symbol.for('CREATE_PAYMENT_INTENT_USECASE'),
  SUBMIT_REVIEW_USECASE:Symbol.for('SUBMIT_REVIEW_USECASE'),
  GET_DRIVER_PROFILE_USECASE:Symbol.for("GET_DRIVER_PROFILE"),
  WALLET_TRANSACTION_USECASE:Symbol.for('WALLET_TRANSACTION_USECASE'),
  
  USER_CONTROLLER:Symbol.for('USER_CONTROLLER'),
  BOOKING_CONTROLLER:Symbol.for("BOOKING_CONTROLLER"),
  ADMIN_CONTROLLER:Symbol.for(" ADMIN_CONTROLLER"),
 AUTH_CONTROLLER:Symbol.for('AUTH_CONTROLLER')

}