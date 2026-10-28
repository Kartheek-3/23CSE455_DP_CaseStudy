import { inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { IRefreshTokenUseCase } from "../../application/use_cases/Interfaces/IRefreshTokenUseCase";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IForgotPasswordUseCase } from "../../application/use_cases/Auth/interface/IForgotPasswordUseCase";
import { IResetPasswordUseCase } from "../../application/use_cases/Auth/interface/IResetPasswordUseCase";
import { IChangePasswordUseCase } from "../../application/use_cases/Auth/interface/IChangePasswordUseCase";
import { ZodHelper } from "../schemas/common/ZodHelper";
import { RefreshTokenSchema, ForgotPasswordSchema, ResetPasswordSchema, LogoutSchema, ChangePasswordSchema } from "../schemas/auth/AuthRequestDTO";
import { AuthError } from "../../domain/errors/Autherror";

import { catchAsync } from "../../infrastructure/utils/catchAsync";

@injectable()
export class AuthController {
  constructor(
    @inject(USECASE_TOKENS.REFRESH_TOKEN_USECASE)
    private _refreshTokenUseCase: IRefreshTokenUseCase,
    @inject(USECASE_TOKENS.FORGOT_PASSWORD_USECASE)
    private _forgotPasswordUseCase: IForgotPasswordUseCase,
    @inject(USECASE_TOKENS.RESET_PASSWORD_USECASE)
    private _resetPasswordUseCase: IResetPasswordUseCase,
    @inject(USECASE_TOKENS.CHANGE_PASSWORD_USECASE)
    private _changePasswordUseCase: IChangePasswordUseCase
  ) {}

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new AuthError(ERROR_MESSAGES.REFRESHTOKEN_NOTFOUND, HTTP_STATUS_CODES.FORBIDDEN);
    }

    // 1. Execute
    const result = await this._refreshTokenUseCase.execute(refreshToken);

    res.status(HTTP_STATUS_CODES.OK).json({ success: true, accessToken: result });
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    // 1. DTO Validation
    const { email, role } = ZodHelper.validate(ForgotPasswordSchema, req.body);

    // 2. Execute
    await this._forgotPasswordUseCase.execute(email, role);
    res.status(HTTP_STATUS_CODES.OK).json({ 
      success: true, 
      message: `check ${role} mail for reset password` 
    });
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    // 1. DTO Validation
    const { token, newPassword, role } = ZodHelper.validate(ResetPasswordSchema, req.body);

    // 2. Execute
    await this._resetPasswordUseCase.execute(token, newPassword, role);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: `${role} Password reset successful`,
    });
  });

  logout = (req: Request, res: Response) => {
    // 1. Clear Cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(HTTP_STATUS_CODES.OK).json({ 
      success: true, 
      message: `Logout successful` 
    });
  };

  ChangePassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthError(ERROR_MESSAGES.USER_ID_NOT_FOUND, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    // 1. DTO Validation
    const { oldPassword, newPassword, role } = ZodHelper.validate(ChangePasswordSchema, req.body);

    // 2. Execute
    await this._changePasswordUseCase.execute(userId, oldPassword, newPassword, role);

    res.status(HTTP_STATUS_CODES.OK).json({ 
      success: true,
      message: "Password changed successfully." 
    });
  });
}
