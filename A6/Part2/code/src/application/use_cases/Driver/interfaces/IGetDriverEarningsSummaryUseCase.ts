export interface IGetDriverEarningsSummaryUseCase {
  execute(
    driverId: string,
    year: number,
    month?: number
  ): Promise<{
    chartData: { label: string; totalEarnings: number }[];
    totalEarnings: number;
    totalRides: number;
  }>;
}
