export interface IGetBookingStatusSummaryUseCase {
  execute(
    driverId: string,
    year?: number,
    month?: number
  ): Promise<Record<string, number>>;
}
