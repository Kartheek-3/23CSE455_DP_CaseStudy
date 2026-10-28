export interface IGetAdminDashboardStatsUseCase {
  execute(): Promise<{
    earnings: {
      today: number;
      thisWeek: number;
      total: number;
    };
    finance: {
      totalRevenue: number;
      totalDriverPayout: number;
      totalPlatformProfit: number;
    };
    rideStats: {
      completed: number;
      pending: number;
      rejected: number;
      cancelled: number;
    };
    earningsTrend: Array<{ date: string; earnings: number }>;
  }>;
}
