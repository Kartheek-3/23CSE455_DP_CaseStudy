export interface IAcknowledgeBookingUseCase {
  execute(bookingId: string): Promise<void>;
}
