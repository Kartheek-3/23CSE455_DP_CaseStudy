import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../constants/Tokens";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { IGetAdminDashboardStatsUseCase } from "./Interfaces/IGetAdminDashboardStatsUseCase";

@injectable()
export class GetAdminDashboardStats implements IGetAdminDashboardStatsUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute() {
    const rawStats = await this._bookingRepo.getAdminDashboardStats();

    // Default response structure to prevent frontend crashes
    const defaultStats = {
      earnings: { 
        today: 0, 
        thisWeek: 0, 
        total: 0 
      },
      finance: { 
        totalRevenue: 0, 
        totalDriverPayout: 0, 
        totalPlatformProfit: 0 
      },
      rideStats: { 
        completed: 0, 
        pending: 0, 
        rejected: 0, 
        cancelled: 0 
      },
      earningsTrend: [] as { date: string; earnings: number }[]
    };

    if (!rawStats) return defaultStats;

    // 1. Process Finance & Earnings (platform_fee only where completed)
    const finance = rawStats.finance?.[0] || {};
    defaultStats.earnings = {
      today: finance.todayPlatformProfit || 0,
      thisWeek: finance.weekPlatformProfit || 0,
      total: finance.totalPlatformProfit || 0
    };

    defaultStats.finance = {
      totalRevenue: finance.totalRevenue || 0,
      totalDriverPayout: finance.totalDriverPayout || 0,
      totalPlatformProfit: finance.totalPlatformProfit || 0
    };

    // 2. Process Ride Stats with normalization (Mongo _id -> lowercase keys)
    rawStats.rideStats?.forEach((stat) => {
      const status = stat._id?.toLowerCase() as keyof typeof defaultStats.rideStats;
      if (status && status in defaultStats.rideStats) {
        defaultStats.rideStats[status] = stat.count || 0;
      }
    });

    // 3. Process Trend Data for professional graph visualization
    defaultStats.earningsTrend = rawStats.earningsTrend?.map((item) => ({
      date: item._id,
      earnings: item.earnings || 0
    })) || [];

    return defaultStats;
  }
}
