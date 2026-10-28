import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { PaginatedResult } from "../../domain/repositories/IBookingrepository";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IRegisterDriverUseCase } from "../../application/use_cases/Driver/interfaces/IRegisterDriverUseCase";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IVerifyOtp } from "../../application/use_cases/Interfaces/IVerifyOtp";
import { IResendOTP } from "../../application/use_cases/Interfaces/IResendOTP";
import { TOKENS } from "../../constants/Tokens";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";
import { IGetDriverProfile } from "../../application/use_cases/Driver/interfaces/IGetDriverProfile";
import { IGetUserData } from "../../application/use_cases/User/interfaces/IGetUserData";
import { IEditDriverProfile } from "../../application/use_cases/Driver/interfaces/IEditDriverProfile";
import { IOnboardDriverUseCase } from "../../application/use_cases/Driver/interfaces/IOnboardDriverUseCase";
import { IGetBooking } from "../../application/use_cases/Driver/interfaces/IGetUserBooking";
import { IVerifyDriverPaymentAccount } from "../../application/use_cases/Driver/interfaces/IVerifyDriverPaymentAccount";
import { ZodHelper } from "../schemas/common/ZodHelper";
import { RegisterDriverSchema, VerifyDriverOtpSchema, DriverLoginSchema, ResendDriverOtpSchema, EditDriverProfileSchema, OnboardDriverSchema, UserIdParamSchema, DriverBookingPaginationSchema, VerifyAccountSchema } from "../schemas/driver/DriverRequestDTO";
import { toUserResponse } from "../../application/dto/user/UserResponseDto";
import { toDriverFullResponse } from "../../application/dto/driver/DriverResponseDto";
import { DriverIdParamSchema } from "../schemas/user/UserDTO";
import { z } from "zod";
import { catchAsync } from "../../infrastructure/utils/catchAsync";
@injectable()
export class DriverController {

  constructor(
    @inject(USECASE_TOKENS.REGISTER_DRIVER_USECASE)
    private _registerDriverUseCase: IRegisterDriverUseCase,
    @inject(TOKENS.VERIFY_OTP_USECAE)
    private _verifyOtpUsecase: IVerifyOtp,
    @inject(TOKENS.LOGIN_USECASE)
    private _loginUsecase: ILogin,
    @inject(TOKENS.GET_DRIVER_PROFILE_USECASE)
    private _getDriverProfileUsecase: IGetDriverProfile,
    @inject(TOKENS.GET_USER_DATA_USECASE)
    private _getUserDataUsecase: IGetUserData,
    @inject(TOKENS.RESEND_OTP_USECASE)
    private _resendOtpUsecase: IResendOTP,
     @inject(USECASE_TOKENS.EDIT_DRIVER_PROFILE)
    private _editDriverProfileUseCase: IEditDriverProfile,
      @inject(USECASE_TOKENS.ONBOARD_DRIVER_USECASE)
    private _onboardDriverUseCase: IOnboardDriverUseCase,
    @inject(USECASE_TOKENS.GET_USERBOOKINGS_USECASE)
    private _getUserBookingsUsecase:IGetBooking,
    @inject(USECASE_TOKENS.VERIFY_DRIVER_PAYMENT_ACCOUNT_USECASE)
    private _verifyDriverPaymentAccount: IVerifyDriverPaymentAccount
  ) {}

  registerDriver = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const validatedData = ZodHelper.validate(RegisterDriverSchema, req.body);

    // 2. Execute
    const response = await this._registerDriverUseCase.execute(validatedData);
    
    // 3. Response
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, ...response });
  });

  verifyOTPDriver = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { email, otp } = ZodHelper.validate(VerifyDriverOtpSchema, req.body);

    // 2. Execute
    const { accessToken, refreshToken, user } = await this._verifyOtpUsecase.execute(email, otp, "driver");
    
    // 3. Set Cookie and Response
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: Number(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
    });
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, accessToken, user });
  });

  login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { email, password, role } = ZodHelper.validate(DriverLoginSchema, req.body);

    // 2. Execute
    const result = await this._loginUsecase.execute(email, password, role);

    // 3. Set Cookie and Response
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: Number(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
    });
    res.status(HTTP_STATUS_CODES.OK).json({
      accessToken: result.accessToken,
      role: result.role,
    });
  });
  getDriverProfile = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const driverId = req.user?.id
    if (!driverId) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_ID_NOT_FOUND, HTTP_STATUS_CODES.BAD_REQUEST)
    }
    const driver = await this._getDriverProfileUsecase.execute(driverId);
    if (!driver) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
    // Return sanitized full profile for the driver's dashboard
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, driver });
  });

  getUserById = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. Param Validation
    const { id } = ZodHelper.validate(UserIdParamSchema, req.params); 

    // 2. Execute
    const user = await this._getUserDataUsecase.execute(id);
    if (!user) {
      throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
    
    // 3. Response 
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, user });
  });

  editDriverProfile = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { id: driverId } = ZodHelper.validate(UserIdParamSchema, req.params);
    const validatedData = ZodHelper.validate(EditDriverProfileSchema, req.body);

    // 2. Execute
    // We remove _id from body if present to avoid type conflicts with params driverId
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...updateData } = validatedData;
    
    const updatedDriver = await this._editDriverProfileUseCase.execute(
      driverId,
      updateData
    );

    if (!updatedDriver) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
      
    res.status(HTTP_STATUS_CODES.OK).json({success: true, driver: updatedDriver });
  });
  
  onboardDriver = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { email, driverId: bodyDriverId } = ZodHelper.validate(OnboardDriverSchema, req.body);
    
    const driverId = bodyDriverId || req.user?.id;
    
    if (!driverId) {
      throw new AuthError('driverId is required', HTTP_STATUS_CODES.BAD_REQUEST);
    }

    // 2. Execute
    const onboardingUrl = await this._onboardDriverUseCase.execute(email, driverId);

    res.status(HTTP_STATUS_CODES.OK).json({ url: onboardingUrl });
  });

  getBookingsForDriver = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const driverId=req.user?.id;
    if(!driverId){
      throw new AuthError(ERROR_MESSAGES.DRIVER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
    }

    // 1. Query Validation
    const { page, limit } = ZodHelper.validate(DriverBookingPaginationSchema, req.query);

    // 2. Execute
    const paginatedBookings = await this._getUserBookingsUsecase.execute(driverId, page, limit);

    // 3. Response 
    res.status(HTTP_STATUS_CODES.OK).json({
      data: paginatedBookings.data,
      total: paginatedBookings.total,
      totalPages: paginatedBookings.totalPages,
      currentPage: paginatedBookings.page,
    });
  });

  verifyAccount = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { driverId } = ZodHelper.validate(VerifyAccountSchema, req.body);
  
    // 2. Execute
    await this._verifyDriverPaymentAccount.execute(driverId);

    // 3. Response
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, message: 'Payment activated for driver' });
  });

  resendOTP = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { email, role } = ZodHelper.validate(ResendDriverOtpSchema, req.body);

    // 2. Execute
    const result = await this._resendOtpUsecase.execute(email, role);

    // 3. Response
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, ...result });
  });
  
}
