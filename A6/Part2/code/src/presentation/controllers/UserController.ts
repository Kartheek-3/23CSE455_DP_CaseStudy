import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IRegisterUser } from "../../application/use_cases/User/interfaces/IRegisterUser";
import { TOKENS } from "../../constants/Tokens";
import { INFO_MESSAGES } from "../../constants/Info_Messages";
import { IGetUserData } from "../../application/use_cases/User/interfaces/IGetUserData";
import { IVerifyOtp } from "../../application/use_cases/Interfaces/IVerifyOtp";
import { IResendOTP } from "../../application/use_cases/Interfaces/IResendOTP";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";
import { IAddVehicleUseCase } from "../../application/use_cases/Interfaces/IAddvehicle";
import { IEditVehicleUseCase } from "../../application/use_cases/User/interfaces/IEditVehicleUseCase";
import { IGetVehiclesByUserUseCase } from "../../application/use_cases/User/interfaces/IGetVehiclesByUserUseCase";
import { IUpdateUserData } from "../../application/use_cases/User/interfaces/IUpdateUserData";
import { ICreatePaymentIntent } from "../../application/use_cases/User/interfaces/ICreatePaymentIntent";
import { IGetDriverProfile } from "../../application/use_cases/Driver/interfaces/IGetDriverProfile";
import { IWalletTransaction } from "../../application/use_cases/User/interfaces/IWalletTransaction";
import { ISubmitDriverReview } from "../../application/use_cases/User/interfaces/ISubmitDriverReview";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IFindNearbyDriversUseCase } from "../../application/use_cases/User/interfaces/IFindNearbyDriversUseCase";
import { IGetNearbyDriverDetailsUseCase } from "../../application/use_cases/Interfaces/IGetNearbyDriverDetailsUseCase";
import { ZodHelper } from "../schemas/common/ZodHelper";
import { AddVehicleSchema, CreatePaymentIntentSchema, DriverIdParamSchema, EditVehicleSchema, FetchDriversSchema, GetNearbyDriverQuerySchema, LoginSchema, RegisterSchema, ResendOtpSchema, SubmitReviewSchema, UpdateUserSchema, VehicleIdParamSchema, VerifyOtpSchema, WalletPaginationSchema } from "../schemas/user/UserDTO";
import { z } from "zod";
import { User } from "../../domain/models/User";

import { catchAsync } from "../../infrastructure/utils/catchAsync";

@injectable()
export class UserController {
  constructor(
    @inject(TOKENS.REGISTER_USER_USECASE)
    private _registerUsecase: IRegisterUser,
    @inject(TOKENS.GET_USER_DATA_USECASE)
    private _getUserDataUsecase: IGetUserData,
    @inject(TOKENS.VERIFY_OTP_USECAE)
    private _verifyOtpUsecase: IVerifyOtp,
    @inject(TOKENS.RESEND_OTP_USECASE)
    private _resendOtpUsecase: IResendOTP,
    @inject(TOKENS.LOGIN_USECASE)
    private _loginUsecase: ILogin,
    @inject(TOKENS.ADD_VEHICLE_USECASE)
    private _addVehicleUsecase: IAddVehicleUseCase,
    @inject(TOKENS.EDIT_VEHICLE_USECASE)
    private _editVehicleUsecase: IEditVehicleUseCase,
    @inject(TOKENS.GET_VEHICLES_BY_USER_USECASE)
    private _getVehiclebyUserUsecase: IGetVehiclesByUserUseCase,
    @inject(TOKENS.UPDATE_USER_USECASE)
    private _updateuserUsecase: IUpdateUserData,
    @inject(USECASE_TOKENS.FIND_NEARBY_DRIVERS_USECASE)
    private _findNearbyDrivers: IFindNearbyDriversUseCase,
    @inject(TOKENS.CREATE_PAYMENT_INTENT_USECASE)
    private _createPaymentUsecase: ICreatePaymentIntent,
    @inject(TOKENS.GET_DRIVER_PROFILE_USECASE)
    private _getDriverProfileUsecase: IGetDriverProfile,
    @inject(TOKENS.WALLET_TRANSACTION_USECASE)
    private _walletTransactionUsecase: IWalletTransaction,
    @inject(TOKENS.SUBMIT_REVIEW_USECASE)
    private _submitReviewUsecase: ISubmitDriverReview,
    @inject(USECASE_TOKENS.GET_NEARBY_DRIVER_DETAILS_USECASE)
    private _getNearbyDriverDetailsUseCase: IGetNearbyDriverDetailsUseCase
  ) { }

  register = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const validatedData = ZodHelper.validate(RegisterSchema, req.body);

    // 2. Execute Use Case
    const result = await this._registerUsecase.execute(validatedData as User);

    // 3. Response
    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      message: INFO_MESSAGES.USER.REGISTERED,
      user: result
    });
  });
  verifyOTPUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { email, otp } = ZodHelper.validate(VerifyOtpSchema, req.body);

    // 2. Execute Use Case
    const { accessToken, refreshToken, user } = await this._verifyOtpUsecase.execute(email, otp, "user");

    // 3. Set Cookie and Response
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: Number(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
    });
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, accessToken, user });
  });

  resendOTP = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { email, role } = ZodHelper.validate(ResendOtpSchema, req.body);

    // 2. Execute Use Case
    const result = await this._resendOtpUsecase.execute(email, role);

    // 3. Response
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, ...result });
  });

  login = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { email, password, role } = ZodHelper.validate(LoginSchema, req.body);

    // 2. Execute Use Case
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

  addVehicle = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. DTO Validation
    const validatedData = ZodHelper.validate(AddVehicleSchema, req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AuthError(
        ERROR_MESSAGES.USER_ID_NOT_FOUND,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // 2. Execute Use Case
    const vehicle = await this._addVehicleUsecase.execute({
      ...validatedData,
      userId: userId,
    });

    res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: vehicle });
  });

  editVehicle = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { vehicleId } = ZodHelper.validate(VehicleIdParamSchema, req.params);
    const validatedData = ZodHelper.validate(EditVehicleSchema, req.body);

    // 2. Execute Use Case
    const updatedVehicle = await this._editVehicleUsecase.execute(
      vehicleId,
      validatedData
    );

    res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: updatedVehicle });
  });

  getAllVehicle = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(
        ERROR_MESSAGES.USER_ID_NOT_FOUND,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    const vehicles = await this._getVehiclebyUserUsecase.execute(userId!);

    res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: vehicles });
  });

  getUserData = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(
        ERROR_MESSAGES.USER_ID_NOT_FOUND,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    const user = await this._getUserDataUsecase.execute(userId);

    res.status(HTTP_STATUS_CODES.OK).json({ success: true, user });
  });

  updateUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;

    // 1. DTO Validation
    const validatedData = ZodHelper.validate(UpdateUserSchema, req.body);

    if (!userId) {
      throw new AuthError(
        ERROR_MESSAGES.USER_ID_NOT_FOUND,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // 2. Execute Use Case with sanitized data
    const user = await this._updateuserUsecase.execute(userId, validatedData);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: "User Profile Updated Sucessfully",
      user,
    });
  });

  fetchDrivers = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. Authenticated User Check
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(
        ERROR_MESSAGES.USER_ID_NOT_FOUND,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // 2. Query Validation (Automatic page/limit numeric coercion)
    const { page, limit, search, lat, lng } = ZodHelper.validate(FetchDriversSchema, req.query);
   
    // 3. Execute the use case
    const paginatedDrivers = await this._findNearbyDrivers.execute(
      userId,
      page,
      limit,
      search,
      lat,
      lng
    );
    
    // 4. Send paginated Response
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      drivers: paginatedDrivers
    });
  });

  getDriverDetails = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. Param Validation
    const { driverId } = ZodHelper.validate(DriverIdParamSchema, req.params);
    
    // 2. Query Validation (Optional coordinates)
    const { lat, lng } = ZodHelper.validate(GetNearbyDriverQuerySchema, req.query);

    const userId = req.user?.id

    // 3. Execute and return safe Response DTO
    const driver = await this._getNearbyDriverDetailsUseCase.execute(userId!, driverId, lat, lng);
    res.status(HTTP_STATUS_CODES.OK).json(driver);
  });

  createPaymentIntent = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { amount, driverId } = ZodHelper.validate(
      CreatePaymentIntentSchema,
      req.body
    );

    // 2. Execute Use Case
    const result = await this._createPaymentUsecase.execute({
      amount,
      driverId,
    });

    // 3. Response 
    res.status(HTTP_STATUS_CODES.OK).json(result);
  });

  getDriverById = catchAsync(async (req: Request, res: Response): Promise<void> => {
    // 1. Param Validation
    const { driverId } = ZodHelper.validate(DriverIdParamSchema, {
      driverId: req.params.id,
    });

    // 2. Execute
    const driver = await this._getDriverProfileUsecase.execute(driverId);
    
    if (!driver) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    // 3. Return safe Response DTO
    res
      .status(HTTP_STATUS_CODES.OK)
      .json({ success: true, driver });
  });

  WalletTransaction = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. DTO Validation (Automatic numeric coercion)
    const { page, limit } = ZodHelper.validate(WalletPaginationSchema, req.query);

    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(
        ERROR_MESSAGES.USER_ID_NOT_FOUND,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // 2. Execute
    const transactionHistory =
      await this._walletTransactionUsecase.getTransactionHistory(
        userId,
        page,
        limit
      );
    const ballence = await this._walletTransactionUsecase.getWalletBalance(
      userId
    );

    // 3. Response
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, ...transactionHistory, ballence });
  });

  submitReview = catchAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. DTO Validation
    const { driverId, rideId, rating, review } = ZodHelper.validate(
      SubmitReviewSchema,
      req.body
    );

    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(
        ERROR_MESSAGES.USER_ID_NOT_FOUND,
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }

    // 2. Execute
    const createdReview = await this._submitReviewUsecase.execute({
      driverId,
      userId,
      rideId,
      rating,
      review,
    });

    // 3. Response
    res.status(HTTP_STATUS_CODES.CREATED).json(createdReview);
  });
}



