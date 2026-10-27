import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { TOKENS } from "../../../constants/Tokens";
import { IDashboardStats, IGetDriverDashboardStatsUseCase } from "./interfaces/IGetDriverDashboardStatsUseCase";

@injectable()
export class GetDriverDashboardStats implements IGetDriverDashboardStatsUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute(driverId: string): Promise<IDashboardStats> {
    const rawData = await this._bookingRepo.getDriverDashboardStats(driverId);

    // Default structure if no data exists
    const stats: IDashboardStats = {
      earnings: {
        today: 0,
        thisWeek: 0,
        total: 0,
      },
      rideStats: {
        completed: 0,
        pending: 0,
        rejected: 0,
        cancelled: 0,
      },
    };

    if (rawData.earnings && rawData.earnings.length > 0) {
      stats.earnings.today = rawData.earnings[0].today || 0;
      stats.earnings.thisWeek = rawData.earnings[0].thisWeek || 0;
      stats.earnings.total = rawData.earnings[0].total || 0;
    }

    if (rawData.rideStats && rawData.rideStats.length > 0) {
      rawData.rideStats.forEach((item) => {
        const status = item._id ? item._id.toLowerCase() : "";
        if (status === "completed") stats.rideStats.completed = item.count;
        else if (status === "pending") stats.rideStats.pending = item.count;
        else if (status === "rejected") stats.rideStats.rejected = item.count;
        else if (status === "cancelled") stats.rideStats.cancelled = item.count;
      });
    }

    return stats;
  }
}
