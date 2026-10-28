export interface IDashboardStats {
  earnings: {
    today: number;
    thisWeek: number;
    total: number;
  };
  rideStats: {
    completed: number;
    pending: number;
    rejected: number;
    cancelled: number;
  };
}

export interface IGetDriverDashboardStatsUseCase {
  execute(driverId: string): Promise<IDashboardStats>;
}
