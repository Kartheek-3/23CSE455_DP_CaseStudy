import { inject, injectable } from "tsyringe";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { IAdminChangeDriverStatusUseCase } from "./Interfaces/IAdminChangeDriverStatus";
import { AdminDriverResponseDto, toAdminDriverResponse } from "../../dto/admin/AdminResponseDto";
import { DriverAccount, DriverAccountStatus } from "../../../domain/driver/DriverAccountState";

@injectable()
export class AdminChangeDriverStatus implements IAdminChangeDriverStatusUseCase  {
  constructor(
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository,
    @inject(TOKENS.NOTIFICATION_SERVICE)
    private _notificationService: INotificationService
  ) {}

  async execute(
    driverId: string,
    status: DriverAccountStatus,
    reason?: string
  ): Promise<AdminDriverResponseDto | null> {
    const driver = await this._driverRepository.findDriverById(driverId);
    if (!driver) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    // The current state object decides whether this change is allowed (throws otherwise).
    const nextStatus = new DriverAccount(driver.status).changeTo(status, reason);

    const updatedDriver = await this._driverRepository.updateStatus(driverId, nextStatus, reason);
    await this._notificationService.adminChangeDriverStatusNotification(driverId, { status: nextStatus, reason });

    return updatedDriver ? toAdminDriverResponse(updatedDriver) : null;
  }
}
