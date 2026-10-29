import { container } from "tsyringe";
import { IRegisterUser } from "../../application/use_cases/User/interfaces/IRegisterUser";
import { TOKENS } from "../../constants/Tokens";
import { RegisterUser } from "../../application/use_cases/User/RegisterUser";
import { IGetUserData } from "../../application/use_cases/User/interfaces/IGetUserData";
import { GetUserData } from "../../application/use_cases/User/GetUserData";
import { IVerifyOtp } from "../../application/use_cases/Interfaces/IVerifyOtp";
import { VerifyOTP } from "../../application/use_cases/VerifyOTP";
import { IResendOTP } from "../../application/use_cases/Interfaces/IResendOTP";
import { ResendOTP } from "../../application/use_cases/ResendOTP";
import { Login } from "../../application/use_cases/Login";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";
import { IAddVehicleUseCase } from "../../application/use_cases/Interfaces/IAddvehicle";
import { AddVehicle } from "../../application/use_cases/User/AddVehicle";
import { IEditVehicleUseCase } from "../../application/use_cases/User/interfaces/IEditVehicleUseCase";
import { EditVehicle } from "../../application/use_cases/User/EditVehicle";
import { IGetVehiclesByUserUseCase } from "../../application/use_cases/User/interfaces/IGetVehiclesByUserUseCase";
import { GetVehiclesByUser } from "../../application/use_cases/User/GetVehiclesByUser";
import { IUpdateUserData } from "../../application/use_cases/User/interfaces/IUpdateUserData";
import { UpdateUserData } from "../../application/use_cases/User/UpdateUserData";
import { ICreatePaymentIntent } from "../../application/use_cases/User/interfaces/ICreatePaymentIntent";
import { CreatePaymentIntent } from "../../application/use_cases/User/CreatePaymentIntent";
import { IGetDriverProfile } from "../../application/use_cases/Driver/interfaces/IGetDriverProfile";
import { GetDriverProfile } from "../../application/use_cases/Driver/Getdriverprofile";
import { IWalletTransaction } from "../../application/use_cases/User/interfaces/IWalletTransaction";
import { WalletTransactionUseCase } from "../../application/use_cases/User/walletTransaction";
import { ISubmitDriverReview } from "../../application/use_cases/User/interfaces/ISubmitDriverReview";
import { SubmitDriverReview } from "../../application/use_cases/User/SubmitRating";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IRegisterDriverUseCase } from "../../application/use_cases/Driver/interfaces/IRegisterDriverUseCase";
import { RegisterDriver } from "../../application/use_cases/Driver/RegisterDriver";
import { IAcceptBookingUseCase } from "../../application/use_cases/Driver/interfaces/IAcceptBookingUseCase";
import { AcceptBooking } from "../../application/use_cases/Driver/AcceptBooking";
import { EditDriverProfile } from "../../application/use_cases/Driver/EditDriverProfile";
import { IEditDriverProfile } from "../../application/use_cases/Driver/interfaces/IEditDriverProfile";
import { IOnboardDriverUseCase } from "../../application/use_cases/Driver/interfaces/IOnboardDriverUseCase";
import { OnboardDriverUseCase } from "../../application/use_cases/Driver/DriverOnboarding";
import { IGetBooking } from "../../application/use_cases/Driver/interfaces/IGetUserBooking";
import { GetUserBookings } from "../../application/use_cases/Driver/Getdriverbooking";
import { IVerifyDriverPaymentAccount } from "../../application/use_cases/Driver/interfaces/IVerifyDriverPaymentAccount";
import { VerifyDriverPaymentAccount } from "../../application/use_cases/Driver/VerifyAccountStatus";
import { IBookDriverUseCase } from "../../application/use_cases/User/interfaces/IBookDriverUseCase";
import { BookDriver } from "../../application/use_cases/User/BookDriver";
import { IGetEstimatedFare } from "../../application/use_cases/User/interfaces/IGetEstimatedFare";
import { GetEstimatedFare } from "../../application/use_cases/User/GetEstimatedFare";
import { IGetUserBookingsUseCase } from "../../application/use_cases/User/interfaces/IGetUserBookingsUseCase";
import { GetUserBookingsUseCase } from "../../application/use_cases/User/GetUserbooking";
import { IGetRideHistoryUseCase } from "../../application/use_cases/User/interfaces/IGetRideHistoryUseCase";
import { GetRideHistory } from "../../application/use_cases/User/GetRideHistory";
import { IAttachPaymentIntentIdToBookingUseCase } from "../../application/use_cases/User/interfaces/IAttachPaymentIntentIdToBookingUseCase";
import { AttachPaymentIntentIdToBooking } from "../../application/use_cases/User/AttachPaymentIntentIdToBooking";
import { IUpdateBookingStatusUseCase } from "../../application/use_cases/Driver/interfaces/IUpdateBookingStatusUseCase";
import { UpdateBookingStatus } from "../../application/use_cases/Driver/UpdateBookingstatus";
import { IGetAllBookingsUseCase } from "../../application/use_cases/Admin/Interfaces/IGetAllBookingsUseCase";
import { GetAllBookings } from "../../application/use_cases/Admin/GetAllRides";
import { ICancelBookingUseCase } from "../../application/use_cases/User/interfaces/ICancelBookingUseCase";
import { CancelBookingInputUseCase } from "../../application/use_cases/User/CancelBooking";
import { IGetMessagesByBookingIdUseCase } from "../../application/use_cases/Interfaces/IGetMessage";
import { GetMessagesByBookingId } from "../../application/use_cases/GetRidechat";
import { IDeleteMessageUseCase } from "../../application/use_cases/Interfaces/IDeleteMessageUseCase";
import { DeleteMessageUseCase } from "../../application/use_cases/deleteMessage";
import { IGenerateSignedUrlUseCase } from "../../application/use_cases/Interfaces/IGenerateSignedUrlUseCase";
import { GenerateSignedUrl } from "../../application/use_cases/GenerateSignedUrl";
import { IWalletBalanceUseCase } from "../../application/use_cases/User/interfaces/IWalletBalanceUseCase";
import { WalletBallence } from "../../application/use_cases/User/WalletBallence";
import { IWalletPaymentUseCase } from "../../application/use_cases/User/interfaces/IWalletPaymentUseCase";
import { WalletPayment } from "../../application/use_cases/User/WalletRidePayment";
import { IGetDriverReviewsUseCase } from "../../application/use_cases/Driver/interfaces/IGetDriverReviewsUseCase";
import { GetDriverReviews } from "../../application/use_cases/Driver/DriverReview";
import { IGetBookingStatusSummaryUseCase } from "../../application/use_cases/Driver/interfaces/IGetBookingStatusSummaryUseCase";
import { GetBookingStatusSummary } from "../../application/use_cases/Driver/GetBookingStatusSummary";
import { IGetDriverEarningsSummaryUseCase } from "../../application/use_cases/Driver/interfaces/IGetDriverEarningsSummaryUseCase";
import { GetDriverEarningsSummary } from "../../application/use_cases/Driver/GetMonthlyEarningsReport";
import { IGetAllUsersUseCase } from "../../application/use_cases/Admin/Interfaces/IGetAllUsersUseCase";
import { GetAllUsers } from "../../application/use_cases/Admin/GetAllusers";
import { IBlockUserUseCase } from "../../application/use_cases/Admin/Interfaces/IBlockUserUseCase";
import { BlockUserUseCase } from "../../application/use_cases/Admin/BlockUser";
import { IGetDriversUseCase } from "../../application/use_cases/Admin/Interfaces/IGetDriversUseCase";
import { GetDrivers } from "../../application/use_cases/Admin/GetDrivers";
import { IAdminChangeDriverStatusUseCase } from "../../application/use_cases/Admin/Interfaces/IAdminChangeDriverStatus";
import { AdminChangeDriverStatus } from "../../application/use_cases/Admin/AdminChangeDriverStatus";
import { IBlockOrUnblockDriverUseCase } from "../../application/use_cases/Admin/Interfaces/IBlockOrUnblockDriverUseCase";
import { BlockOrUnblockDriver } from "../../application/use_cases/Admin/BlockOrUnblockDriver";
import { IRefreshTokenUseCase } from "../../application/use_cases/Interfaces/IRefreshTokenUseCase";
import { RefreshToken  } from "../../application/use_cases/Refreshtoken";
import { IForgotPasswordUseCase } from "../../application/use_cases/Auth/interface/IForgotPasswordUseCase";
import { ForgotPasswordUseCase } from "../../application/use_cases/Auth/ForgotPasswordUseCase";
import { IResetPasswordUseCase } from "../../application/use_cases/Auth/interface/IResetPasswordUseCase";
import { ResetPasswordUseCase } from "../../application/use_cases/Auth/ResetPasswordUseCase";
import { IChangePasswordUseCase } from "../../application/use_cases/Auth/interface/IChangePasswordUseCase";
import { ChangePassword } from "../../application/use_cases/Auth/ChangePassword";
import { IFindNearbyDriversUseCase } from "../../application/use_cases/User/interfaces/IFindNearbyDriversUseCase";
import { FindNearbyDrivers } from "../../application/use_cases/User/FindNearbyDrivers";
import { IGetNearbyDriverDetailsUseCase } from "../../application/use_cases/Interfaces/IGetNearbyDriverDetailsUseCase";
import { GetNearbyDriverDetails } from "../../application/use_cases/User/GetNearbyDriverDetails";
import { IGetDriverDashboardStatsUseCase } from "../../application/use_cases/Driver/interfaces/IGetDriverDashboardStatsUseCase";
import { GetDriverDashboardStats } from "../../application/use_cases/Driver/GetDriverDashboardStats";
import { GetAdminDashboardStats } from "../../application/use_cases/Admin/GetAdminDashboardStats";
import { IGetAdminDashboardStatsUseCase } from "../../application/use_cases/Admin/Interfaces/IGetAdminDashboardStatsUseCase";
import { GenerateChatSignedUrl } from "../../application/use_cases/chatGetSignedUrl";
import { IAcknowledgeBookingUseCase } from "../../application/use_cases/User/interfaces/IAcknowledgeBookingUseCase";
import { AcknowledgeBookingUseCase } from "../../application/use_cases/User/AcknowledgeBooking";

container.registerSingleton<IRegisterUser>(
  TOKENS.REGISTER_USER_USECASE,
  RegisterUser 
);

container.registerSingleton<IGetUserData>(
TOKENS.GET_USER_DATA_USECASE,
GetUserData
)
 
container.registerSingleton<IVerifyOtp>(
TOKENS.VERIFY_OTP_USECAE,
VerifyOTP
)
container.registerSingleton<IResendOTP>(TOKENS.RESEND_OTP_USECASE, ResendOTP);
container.registerSingleton<ILogin>(TOKENS.LOGIN_USECASE, Login);
container.registerSingleton<IAddVehicleUseCase>(TOKENS.ADD_VEHICLE_USECASE,
  AddVehicle
);
container.registerSingleton<IEditVehicleUseCase>(TOKENS.EDIT_VEHICLE_USECASE, 
 EditVehicle,
);
container.register<IGetVehiclesByUserUseCase>(TOKENS.GET_VEHICLES_BY_USER_USECASE,
   GetVehiclesByUser,
);
container.registerSingleton<IUpdateUserData>(TOKENS.UPDATE_USER_USECASE,
  UpdateUserData,
);

container.registerSingleton<ICreatePaymentIntent>(
  TOKENS.CREATE_PAYMENT_INTENT_USECASE,
  CreatePaymentIntent
);
container.registerSingleton<IGetDriverProfile>(
  TOKENS.GET_DRIVER_PROFILE_USECASE,
  GetDriverProfile
);
container.registerSingleton<IWalletTransaction>(
  TOKENS.WALLET_TRANSACTION_USECASE,
  WalletTransactionUseCase
);

container.registerSingleton<ISubmitDriverReview>(
TOKENS.SUBMIT_REVIEW_USECASE,
SubmitDriverReview 
)

container.registerSingleton<IRegisterDriverUseCase>(
  USECASE_TOKENS.REGISTER_DRIVER_USECASE,
  RegisterDriver

)
container.registerSingleton<IEditDriverProfile>(USECASE_TOKENS.EDIT_DRIVER_PROFILE,
 EditDriverProfile);
 container.registerSingleton<IOnboardDriverUseCase>(
  USECASE_TOKENS.ONBOARD_DRIVER_USECASE,
   OnboardDriverUseCase 
);

container.registerSingleton<IGetBooking>(USECASE_TOKENS.GET_USERBOOKINGS_USECASE,GetUserBookings )
container.registerSingleton<IVerifyDriverPaymentAccount>(
  USECASE_TOKENS.VERIFY_DRIVER_PAYMENT_ACCOUNT_USECASE,
   VerifyDriverPaymentAccount
);
container.registerSingleton<IBookDriverUseCase>(
 USECASE_TOKENS.BOOK_DRIVER_USECASE,
  BookDriver
);
container.registerSingleton<IAcceptBookingUseCase>(
  USECASE_TOKENS.ACCEPT_BOOKING_USECASE,
  AcceptBooking
);
container.registerSingleton<IGetEstimatedFare>(
  USECASE_TOKENS.GET_ESTIMATED_FARE_USECASE,
  GetEstimatedFare
);

container.registerSingleton<IGetUserBookingsUseCase>(USECASE_TOKENS.IGET_USER_BOOKINGS_USECASE, 
   GetUserBookingsUseCase
);
container.registerSingleton<IAttachPaymentIntentIdToBookingUseCase>(
  USECASE_TOKENS.ATTACH_PAYMENT_INTENT_USECASE,
  AttachPaymentIntentIdToBooking
);
container.registerSingleton<IUpdateBookingStatusUseCase>(
 USECASE_TOKENS.UPDATE_BOOKING_STATUS_USECASE,
  UpdateBookingStatus
);
container.registerSingleton<IGetAllBookingsUseCase>(
  USECASE_TOKENS.GET_ALL_BOOKINGS_USECASE,
  GetAllBookings
);
container.registerSingleton<ICancelBookingUseCase>(
  USECASE_TOKENS.CANCEL_BOOKING_USECASE,
  CancelBookingInputUseCase
);
container.registerSingleton<IGetMessagesByBookingIdUseCase>(
  USECASE_TOKENS.GET_MESSAGES_BY_BOOKING_USECASE,
  GetMessagesByBookingId
);
container.registerSingleton<IGetRideHistoryUseCase>(
  USECASE_TOKENS.GET_RIDE_HISTORY_USECASE,
  GetRideHistory
);
container.registerSingleton<IDeleteMessageUseCase>(
  USECASE_TOKENS.DELETE_MESSAGE_USECASE,
  DeleteMessageUseCase
);
container.registerSingleton<IGenerateSignedUrlUseCase>(
  USECASE_TOKENS.GENERATE_SIGNED_URL_USECASE,
  GenerateSignedUrl
);
container.registerSingleton<GenerateChatSignedUrl>(
  USECASE_TOKENS.GENERATE_CHAT_SIGNED_URL_USECASE,
  GenerateChatSignedUrl
);
container.registerSingleton<IWalletBalanceUseCase>(
  USECASE_TOKENS.WALLET_BALANCE_USECASE,
  WalletBallence
);
container.registerSingleton<IWalletPaymentUseCase>(
  USECASE_TOKENS.WALLET_PAYMENT_USECASE,
  WalletPayment
);
container.registerSingleton<IGetDriverReviewsUseCase>(
  USECASE_TOKENS.GET_DRIVER_REVIEWS_USECASE,
  GetDriverReviews
);
container.registerSingleton<IGetBookingStatusSummaryUseCase>(
  USECASE_TOKENS.GET_BOOKING_STATUS_SUMMARY_USECASE,
  GetBookingStatusSummary
);
container.registerSingleton<IGetDriverEarningsSummaryUseCase>(
  USECASE_TOKENS.GET_DRIVER_EARNINGS_SUMMARY_USECASE,
  GetDriverEarningsSummary
);
container.registerSingleton<IGetAllUsersUseCase>(
  USECASE_TOKENS.GET_ALL_USERS_USECASE,
  GetAllUsers
);
container.registerSingleton<IBlockUserUseCase>(
  USECASE_TOKENS.BLOCK_USER_USECASE,
  BlockUserUseCase
);
container.registerSingleton<IGetDriversUseCase>(
  USECASE_TOKENS.GET_DRIVERS_USECASE,
  GetDrivers
);
container.registerSingleton<IAdminChangeDriverStatusUseCase>(
  USECASE_TOKENS.ADMIN_CHANGE_DRIVER_STATUS_USECASE,
  AdminChangeDriverStatus
);
container.registerSingleton<IBlockOrUnblockDriverUseCase>(
  USECASE_TOKENS.BLOCK_OR_UNBLOCK_DRIVER_USECASE,
  BlockOrUnblockDriver
);
//Authcontroller related usecase abstraction
container.registerSingleton<IRefreshTokenUseCase>(
 USECASE_TOKENS.REFRESH_TOKEN_USECASE,
  RefreshToken 
);
container.registerSingleton<IForgotPasswordUseCase>(
  USECASE_TOKENS.FORGOT_PASSWORD_USECASE,
  ForgotPasswordUseCase
);
container.registerSingleton<IResetPasswordUseCase>(
  USECASE_TOKENS.RESET_PASSWORD_USECASE,
  ResetPasswordUseCase
);
container.registerSingleton<IChangePasswordUseCase>(
  USECASE_TOKENS.CHANGE_PASSWORD_USECASE,
  ChangePassword
);
container.registerSingleton<IFindNearbyDriversUseCase>(
  USECASE_TOKENS.FIND_NEARBY_DRIVERS_USECASE,
  FindNearbyDrivers
);
container.registerSingleton<IGetNearbyDriverDetailsUseCase>(
  USECASE_TOKENS.GET_NEARBY_DRIVER_DETAILS_USECASE,
  GetNearbyDriverDetails
);
container.registerSingleton<IGetDriverDashboardStatsUseCase>(
  USECASE_TOKENS.GET_DRIVER_DASHBOARD_STATS_USECASE,
  GetDriverDashboardStats
);
container.registerSingleton<IGetAdminDashboardStatsUseCase>(
  USECASE_TOKENS.GET_ADMIN_DASHBOARD_STATS_USECASE,
  GetAdminDashboardStats
);
container.registerSingleton<IAcknowledgeBookingUseCase>(
  USECASE_TOKENS.ACKNOWLEDGE_BOOKING_USECASE,
  AcknowledgeBookingUseCase
);
