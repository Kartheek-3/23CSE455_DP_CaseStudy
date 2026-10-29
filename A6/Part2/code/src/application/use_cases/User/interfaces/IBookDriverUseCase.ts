

import { Booking } from "../../../../domain/models/Booking";
import { BookDriverRequest } from "../../../../presentation/schemas/booking/BookingRequestDTO";

export interface BookDriverInput extends BookDriverRequest {
  userId: string;
}

export interface IBookDriverUseCase {
  execute(data: BookDriverInput): Promise<Booking>;
}
