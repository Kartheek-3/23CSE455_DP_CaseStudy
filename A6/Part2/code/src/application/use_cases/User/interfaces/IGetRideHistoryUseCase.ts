
export interface RideHistoryResponse {
  data: any[]; // We can refine this further to a specific BookingResponse type later
  total: number;
  totalPages: number;
}

export interface IGetRideHistoryUseCase {
  execute(
    role: "user" | "driver",
    id: string,
    page?: number,
    limit?: number
  ): Promise<RideHistoryResponse>;
}
