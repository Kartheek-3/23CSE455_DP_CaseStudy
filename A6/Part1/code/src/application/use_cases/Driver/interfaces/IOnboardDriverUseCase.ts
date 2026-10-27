export interface IOnboardDriverUseCase {
  execute(email: string, driverId: string): Promise<string>;
}
