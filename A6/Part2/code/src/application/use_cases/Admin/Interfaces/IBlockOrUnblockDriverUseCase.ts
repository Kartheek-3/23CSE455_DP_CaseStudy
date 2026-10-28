export interface IBlockOrUnblockDriverUseCase {
  execute(driverId: string, isBlock: boolean): Promise<void>;
}
