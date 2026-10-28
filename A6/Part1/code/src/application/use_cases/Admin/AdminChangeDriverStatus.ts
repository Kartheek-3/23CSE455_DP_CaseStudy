import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IAdminChangeDriverStatusUseCase } from "./Interfaces/IAdminChangeDriverStatus";
import { AdminDriverResponseDto, toAdminDriverResponse } from "../../dto/admin/AdminResponseDto";

@injectable()
export class AdminChangeDriverStatus implements IAdminChangeDriverStatusUseCase  {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository,
    @inject(TOKENS.NOTIFICATION_SERVICE)
    private _notificationService: INotificationService
  ) {}

  async execute(
    driverId: string,
    status: "pending" | "approved" | "rejected",
    reason?: string
  ): Promise<AdminDriverResponseDto | null> {

    if (!["pending", "approved", "rejected"].includes(status)) {
        throw new AuthError("Invalid status value.", HTTP_STATUS_CODES.BAD_REQUEST);
      }
      
      if (status === "rejected" && !reason) {
        throw new AuthError("Rejection reason is required.", HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
      }
      
    await this._notificationService.adminChangeDriverStatusNotification(driverId, { status, reason });
    const updatedDriver = await this._driverRepository.updateStatus(driverId, status, reason);
    
    return updatedDriver ? toAdminDriverResponse(updatedDriver) : null;
  }
}


