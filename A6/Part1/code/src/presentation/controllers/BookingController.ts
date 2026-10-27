import { NextFunction, Request, Response } from "express";
import { ZodHelper } from "../schemas/common/ZodHelper";
import { catchAsync } from "../../infrastructure/utils/catchAsync";
import {  inject, injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { BookingStatus } from "../../domain/models/Booking";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { IGetRideHistoryUseCase } from "../../application/use_cases/User/interfaces/IGetRideHistoryUseCase";
import { BookDriverSchema, GetEstimatedFareSchema, UserBookingPaginationSchema, AttachPaymentIntentSchema, BookingIdParamSchema, UpdateBookingStatusSchema, RideIdParamSchema, CancelBookingSchema, ChatParamsSchema, MessageParamsSchema, RideHistorySchema, GetChatSignatureSchema, WalletPaymentSchema, DriverReviewParamsSchema, DriverStatsQuerySchema } from "../schemas/booking/BookingRequestDTO";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { GenerateChatSignedUrl } from "../../application/use_cases/chatGetSignedUrl";
import { IBookDriverUseCase } from "../../application/use_cases/User/interfaces/IBookDriverUseCase";
import { IAcceptBookingUseCase } from "../../application/use_cases/Driver/interfaces/IAcceptBookingUseCase";
import { IGetEstimatedFare } from "../../application/use_cases/User/interfaces/IGetEstimatedFare";
import { IGetUserBookingsUseCase } from "../../application/use_cases/User/interfaces/IGetUserBookingsUseCase";
import { IAttachPaymentIntentIdToBookingUseCase } from "../../application/use_cases/User/interfaces/IAttachPaymentIntentIdToBookingUseCase";
import { IUpdateBookingStatusUseCase } from "../../application/use_cases/Driver/interfaces/IUpdateBookingStatusUseCase";
import { IGetAllBookingsUseCase } from "../../application/use_cases/Admin/Interfaces/IGetAllBookingsUseCase";
import { ICancelBookingUseCase } from "../../application/use_cases/User/interfaces/ICancelBookingUseCase";
import { IGetMessagesByBookingIdUseCase } from "../../application/use_cases/Interfaces/IGetMessage";
import { IDeleteMessageUseCase } from "../../application/use_cases/Interfaces/IDeleteMessageUseCase";
import { IGenerateSignedUrlUseCase } from "../../application/use_cases/Interfaces/IGenerateSignedUrlUseCase";
import { IWalletBalanceUseCase } from "../../application/use_cases/User/interfaces/IWalletBalanceUseCase";
import { IWalletPaymentUseCase } from "../../application/use_cases/User/interfaces/IWalletPaymentUseCase";
import { IGetDriverReviewsUseCase } from "../../application/use_cases/Driver/interfaces/IGetDriverReviewsUseCase";
import { IGetBookingStatusSummaryUseCase } from "../../application/use_cases/Driver/interfaces/IGetBookingStatusSummaryUseCase";
import { IGetDriverEarningsSummaryUseCase } from "../../application/use_cases/Driver/interfaces/IGetDriverEarningsSummaryUseCase";
import { IGetDriverDashboardStatsUseCase } from "../../application/use_cases/Driver/interfaces/IGetDriverDashboardStatsUseCase";
import { IAcknowledgeBookingUseCase } from "../../application/use_cases/User/interfaces/IAcknowledgeBookingUseCase";
@injectable()
export class BookingController {

   constructor(
 @inject(USECASE_TOKENS.BOOK_DRIVER_USECASE)
private _bookDriverUseCase: IBookDriverUseCase,
  @inject(USECASE_TOKENS.GET_ESTIMATED_FARE_USECASE)
    private _getEstimatedFareUseCase: IGetEstimatedFare,
  @inject(USECASE_TOKENS.IGET_USER_BOOKINGS_USECASE)
    private _getUserBookingsUseCase: IGetUserBookingsUseCase,
    @inject(USECASE_TOKENS.ATTACH_PAYMENT_INTENT_USECASE)
  private _attachPaymentIntentUseCase: IAttachPaymentIntentIdToBookingUseCase,
     @inject(USECASE_TOKENS.UPDATE_BOOKING_STATUS_USECASE)
    private _updateBookingStatusUseCase: IUpdateBookingStatusUseCase,
      @inject(USECASE_TOKENS.GET_ALL_BOOKINGS_USECASE)
    private _getAllBookingsUseCase: IGetAllBookingsUseCase,
        @inject(USECASE_TOKENS.CANCEL_BOOKING_USECASE)
    private _cancelBookingUseCase: ICancelBookingUseCase,
      @inject(USECASE_TOKENS.GET_MESSAGES_BY_BOOKING_USECASE)
    private _getMessagesByBookingIdUseCase: IGetMessagesByBookingIdUseCase,
        @inject(USECASE_TOKENS.DELETE_MESSAGE_USECASE)
    private _deleteMessageUseCase: IDeleteMessageUseCase,
       @inject(USECASE_TOKENS.GENERATE_SIGNED_URL_USECASE)
    private _generateSignedUrlUseCase: IGenerateSignedUrlUseCase,
    @inject(USECASE_TOKENS.WALLET_BALANCE_USECASE)
    private _walletBalanceUseCase: IWalletBalanceUseCase,
      @inject(USECASE_TOKENS.WALLET_PAYMENT_USECASE)
  private _walletPaymentUseCase: IWalletPaymentUseCase,
    @inject(USECASE_TOKENS.GET_DRIVER_REVIEWS_USECASE)
  private _getDriverReviewsUseCase: IGetDriverReviewsUseCase,
   @inject(USECASE_TOKENS.GET_BOOKING_STATUS_SUMMARY_USECASE)
  private _getBookingStatusSummary: IGetBookingStatusSummaryUseCase,
    @inject(USECASE_TOKENS.GET_DRIVER_EARNINGS_SUMMARY_USECASE)
  private _earningsSummaryUseCase: IGetDriverEarningsSummaryUseCase,
    @inject(USECASE_TOKENS.GET_DRIVER_DASHBOARD_STATS_USECASE)
  private _getDriverDashboardStatsUseCase: IGetDriverDashboardStatsUseCase,
    @inject(USECASE_TOKENS.GET_RIDE_HISTORY_USECASE)
  private _getRideHistoryUseCase: IGetRideHistoryUseCase,
    @inject(USECASE_TOKENS.GENERATE_CHAT_SIGNED_URL_USECASE)
  private _generateChatSignedUrlUseCase: GenerateChatSignedUrl,
    @inject(USECASE_TOKENS.ACCEPT_BOOKING_USECASE)
  private _acceptBookingUseCase: IAcceptBookingUseCase,
    @inject(USECASE_TOKENS.ACKNOWLEDGE_BOOKING_USECASE)
  private _acknowledgeBookingUseCase: IAcknowledgeBookingUseCase

   ){}
  bookDriver = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.UNAUTHORIZED)
    }

    // 1. DTO Validation
    const validatedData = ZodHelper.validate(BookDriverSchema, req.body);

    // 2. Execute
    const booking = await this._bookDriverUseCase.execute({
      userId,
      ...validatedData
    });

    res.status(HTTP_STATUS_CODES.CREATED).json({ success: true, data: booking });
  });

  acceptBooking = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const driverId = req.user?.id;
    const { bookingId } = req.params;

    if (!driverId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    const booking = await this._acceptBookingUseCase.execute({
      bookingId,
      driverId
    });

    res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: booking });
  });

  getEstimatedFare = catchAsync(async (req: Request, res: Response) => {
    // 1. DTO Validation
    const validatedData = ZodHelper.validate(GetEstimatedFareSchema, req.body);
    
    // 2. Execute
    const fare = await this._getEstimatedFareUseCase.execute(validatedData);

    res.status(HTTP_STATUS_CODES.OK).json({ estimatedFare: fare });
  });

  getUserBookings = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
    }

    // 1. Query Validation
    const { page, limit } = ZodHelper.validate(UserBookingPaginationSchema, req.query);

    // 2. Execute
    const { data, total, totalPages } = await this._getUserBookingsUseCase.execute(
      userId,
      page,
      limit
    );

    res.status(HTTP_STATUS_CODES.OK).json({ data, total, totalPages });
  });

  attachPaymentIntent = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND,HTTP_STATUS_CODES.BAD_REQUEST)
    }

    // 1. Param & Body Validation
    const { rideId } = ZodHelper.validate(RideIdParamSchema, req.params);
    const validatedData = ZodHelper.validate(AttachPaymentIntentSchema, req.body);
   
    // 2. Execute
    await this._attachPaymentIntentUseCase.execute({
      rideId,
      userId,
      ...validatedData,
      paymentStatus: validatedData.paymentStatus
    });

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: "PaymentIntent attached successfully",
    });
  });

  updateStatus = catchAsync(async (req: Request, res: Response) => {
    // 1. Param & Body Validation
    const { bookingId } = ZodHelper.validate(BookingIdParamSchema, req.params);
    const validatedData = ZodHelper.validate(UpdateBookingStatusSchema, req.body);

    if (!bookingId) {
      throw new AuthError("Booking ID is required", HTTP_STATUS_CODES.BAD_REQUEST);
    }

    // 2. Execute
    await this._updateBookingStatusUseCase.execute({ 
      bookingId, 
      ...validatedData 
    });

    res.status(HTTP_STATUS_CODES.OK).json({ message: "Booking status updated successfully" });
  });

  getAllBookings = catchAsync(async (req: Request, res: Response) => {
    // 1. Query Validation
    const { page, limit } = ZodHelper.validate(UserBookingPaginationSchema, req.query);

    // 2. Execute
    const bookings = await this._getAllBookingsUseCase.execute(page, limit);

    res.status(HTTP_STATUS_CODES.OK).json({ bookings });
  });

  cancelBooking = catchAsync(async (req: Request, res: Response) => {
    // 1. DTO Validation
    const validatedData = ZodHelper.validate(CancelBookingSchema, req.body);

    // 2. Execute
    await this._cancelBookingUseCase.execute({ 
      ...validatedData, 
      status: BookingStatus.CANCELLED 
    });

    res.status(HTTP_STATUS_CODES.OK).json({ message: "Booking cancelled successfully" });
  });

  getChatByBookingId = catchAsync(async (req: Request, res: Response) => {
    // 1. Param Validation
    const { roomId } = ZodHelper.validate(ChatParamsSchema, req.params);

    if (!roomId) {
      throw new AuthError("Room ID is required",HTTP_STATUS_CODES.BAD_REQUEST)
    }

    // 2. Execute
    const chat = await this._getMessagesByBookingIdUseCase.execute({ bookingId: roomId });

    res.status(HTTP_STATUS_CODES.OK).json({ chat });
  });

  deleteMessage = catchAsync(async (req: Request, res: Response) => {
    // 1. Param Validation
    const { roomId, messageId } = ZodHelper.validate(MessageParamsSchema, req.params);

    // 2. Execute
    await this._deleteMessageUseCase.execute(roomId, messageId);

    res.status(HTTP_STATUS_CODES.OK).json({ success: true, message: "Message deleted" });
  });
  



  getRideHistory = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const id = req.user?.id!;
    const role = req.user?.role! as "user" | "driver";
    
    // 1. Query Validation
    const { page, limit } = ZodHelper.validate(RideHistorySchema, req.query);

    // 2. Execute
    const ridehistory = await this._getRideHistoryUseCase.execute(role, id, page, limit);

    res.status(HTTP_STATUS_CODES.OK).json(ridehistory);
  });

  getChatSignature = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const id = req.user?.id!;
    
    // 1. DTO Validation
    const { fileType } = ZodHelper.validate(GetChatSignatureSchema, req.body);

    // 2. Execute
    const chatUploadMedia = await this._generateChatSignedUrlUseCase.execute(fileType, id);
    res.status(HTTP_STATUS_CODES.OK).json(chatUploadMedia);
  });

  WalletBalance = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id!;
    const balance = await this._walletBalanceUseCase.execute(userId);
    res.status(HTTP_STATUS_CODES.OK).json({ balance });
  });

  WalletPayment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id!;
    
    // 1. DTO Validation
    const { rideId, amount } = ZodHelper.validate(WalletPaymentSchema, req.body);
      
    // 2. Execute
    await this._walletPaymentUseCase.WalletRidePayment(rideId, userId, amount);

    res.status(HTTP_STATUS_CODES.OK).json({ message: "Payment successful" });
  });

  ReviewDriver = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    // 1. Validation
    const { id: driverId } = ZodHelper.validate(DriverReviewParamsSchema, req.params);
    const { page, limit } = ZodHelper.validate(UserBookingPaginationSchema, req.query);
      
    // 2. Execute
    const reviews = await this._getDriverReviewsUseCase.execute(driverId, page, limit);

    res.status(HTTP_STATUS_CODES.OK).json(reviews);
  });

  getDriverBookingStatusSummary = catchAsync(async (req:AuthenticatedRequest, res: Response) => {
    const driverId = req.user?.id!;

    // 1. Query Validation
    const { year, month } = ZodHelper.validate(DriverStatsQuerySchema, req.query);
    
    // 2. Execute
    const result = await this._getBookingStatusSummary.execute(driverId, year, month);

    res.status(HTTP_STATUS_CODES.OK).json(result);
  });

  getDriverEarningsByMonth = catchAsync(async (req:AuthenticatedRequest, res: Response) => {
    const driverId = req.user?.id!;

    // 1. Query Validation
    const { year, month } = ZodHelper.validate(DriverStatsQuerySchema, req.query);
    
    // 2. Execute
    const result = await this._earningsSummaryUseCase.execute(driverId, year || new Date().getFullYear(), month);

    res.status(HTTP_STATUS_CODES.OK).json(result);
  });

  getDriverDashboard = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const driverId = req.user?.id;
    if (!driverId) throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND, HTTP_STATUS_CODES.UNAUTHORIZED);

    const result = await this._getDriverDashboardStatsUseCase.execute(driverId);
    res.status(HTTP_STATUS_CODES.OK).json(result);
  });

  acknowledgeBooking = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND, HTTP_STATUS_CODES.UNAUTHORIZED);
    }
    const { bookingId } = ZodHelper.validate(BookingIdParamSchema, req.params);
    await this._acknowledgeBookingUseCase.execute(bookingId);
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, message: "Booking acknowledged successfully" });
  });

}

