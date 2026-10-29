import { inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import { ZodHelper } from "../schemas/common/ZodHelper";
import { AuthError } from "../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { TOKENS } from "../../constants/Tokens";
import { ILogin } from "../../application/use_cases/Interfaces/ILogin";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IGetAllUsersUseCase } from "../../application/use_cases/Admin/Interfaces/IGetAllUsersUseCase";
import { IBlockUserUseCase } from "../../application/use_cases/Admin/Interfaces/IBlockUserUseCase";
import { IGetDriversUseCase } from "../../application/use_cases/Admin/Interfaces/IGetDriversUseCase";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IAdminChangeDriverStatusUseCase } from "../../application/use_cases/Admin/Interfaces/IAdminChangeDriverStatus";
import { IBlockOrUnblockDriverUseCase } from "../../application/use_cases/Admin/Interfaces/IBlockOrUnblockDriverUseCase";
import { IGetVehiclesByUserUseCase } from "../../application/use_cases/User/interfaces/IGetVehiclesByUserUseCase";
import { IGetAdminDashboardStatsUseCase } from "../../application/use_cases/Admin/Interfaces/IGetAdminDashboardStatsUseCase";
import { AdminLoginSchema, UserIdParamSchema, UpdateUserStatusSchema, DriverIdParamSchema, ChangeDriverStatusSchema, HandleBlockStatusSchema, AdminPaginationSchema } from "../schemas/admin/AdminRequestDTO";

import { catchAsync } from "../../infrastructure/utils/catchAsync";

@injectable()
export class AdminController {
  constructor(
     @inject(TOKENS.LOGIN_USECASE)
     private _loginUsecase: ILogin,
    @inject(USECASE_TOKENS.GET_ALL_USERS_USECASE)
     private _getAllUsersUseCase: IGetAllUsersUseCase,
      @inject(USECASE_TOKENS.BLOCK_USER_USECASE)
    private _blockUserUseCase: IBlockUserUseCase,
     @inject(USECASE_TOKENS.GET_DRIVERS_USECASE)
    private _getDriversUseCase: IGetDriversUseCase,
    @inject(USECASE_TOKENS.ADMIN_CHANGE_DRIVER_STATUS_USECASE)
   private _changeDriverStatusUseCase: IAdminChangeDriverStatusUseCase,
   @inject(USECASE_TOKENS.BLOCK_OR_UNBLOCK_DRIVER_USECASE)
    private _blockOrUnblockDriverUseCase: IBlockOrUnblockDriverUseCase,
    @inject(TOKENS.GET_VEHICLES_BY_USER_USECASE)
    private _getVehicleByUserUseCase: IGetVehiclesByUserUseCase,
    @inject(USECASE_TOKENS.GET_ADMIN_DASHBOARD_STATS_USECASE)
    private _getAdminDashboardStatsUseCase: IGetAdminDashboardStatsUseCase,
  ){}

  login = catchAsync(async (req: Request, res: Response) => {
    // 1. DTO Validation
    const { email, password, role } = ZodHelper.validate(AdminLoginSchema, req.body);

    // 2. Execute
    const { accessToken, refreshToken } = await this._loginUsecase.execute(email, password, role);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: Number(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      accessToken,
      role,
      message: "your admin login successfull",
    });
  });

  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    // 1. Request Validation (Optional pagination params)
    const { page, limit } = ZodHelper.validate(AdminPaginationSchema, req.query);

    // 2. Execute
    const usersWithVehicleCount = await this._getAllUsersUseCase.execute();

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      data: usersWithVehicleCount,
      pagination: { page, limit }
    });
  });

  updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    // 1. Param & Body Validation
    const { userId } = ZodHelper.validate(UserIdParamSchema, req.params);
    const { isBlock } = ZodHelper.validate(UpdateUserStatusSchema, req.body);
  
    // 2. Execute
    const blockedUser = await this._blockUserUseCase.execute(userId, isBlock);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: isBlock
      ? "User blocked successfully"
      : "User unblocked successfully",
      user: blockedUser,
    });
  });

  getAllDrivers = catchAsync(async (req: Request, res: Response) => {
    // 1. Request Validation (pagination params)
    const { page, limit } = ZodHelper.validate(AdminPaginationSchema, req.query);

    // 2. Execute
    const paginatedDrivers = await this._getDriversUseCase.execute(page, limit);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      ...paginatedDrivers
    });
  });

  changeDriverStatus = catchAsync(async (req: Request, res: Response) => {
    // 1. Param & Body Validation
    const { driverId } = ZodHelper.validate(DriverIdParamSchema, req.params);
    const { status, reason } = ZodHelper.validate(ChangeDriverStatusSchema, req.body);

    // 2. Execute the use case
    const updatedDriver = await this._changeDriverStatusUseCase.execute(driverId, status, reason);

    if (!updatedDriver) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND)
    }

   res.status(HTTP_STATUS_CODES.OK).json({
      message: "Driver status updated successfully",
      driver: updatedDriver
    });
  });

  handleBlockStatus = catchAsync(async (req: Request, res: Response) => {
    // 1. Param & Body Validation
    const { driverId } = ZodHelper.validate(DriverIdParamSchema, req.params);
    const { isBlock } = ZodHelper.validate(HandleBlockStatusSchema, req.body);

    // 2. Execute the use case
    await this._blockOrUnblockDriverUseCase.execute(driverId, isBlock);

    res.status(HTTP_STATUS_CODES.OK).json({ success:true, message: `Driver ${isBlock ? "blocked" : "unblocked"} successfully` });
  });

  getVehiclesByUser = catchAsync(async (req: Request, res: Response) => {
    // 1. Param Validation
    const { userId } = ZodHelper.validate(UserIdParamSchema, req.params);
    
    // 2. Execute
    const vehicles = await this._getVehicleByUserUseCase.execute(userId);
    
    res.status(HTTP_STATUS_CODES.OK).json({ success: true, data: vehicles });
  });

  getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await this._getAdminDashboardStatsUseCase.execute();
    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      data: stats,
    });
  });
}
