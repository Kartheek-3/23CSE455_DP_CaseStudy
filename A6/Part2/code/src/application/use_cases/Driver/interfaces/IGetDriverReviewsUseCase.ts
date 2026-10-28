export interface IGetDriverReviewsUseCase {
  execute(driverId: string, page?: number, limit?: number): Promise<any>;
}
