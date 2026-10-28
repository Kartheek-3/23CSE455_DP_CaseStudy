
import { RegisterDriverRequest } from "../../../../presentation/schemas/driver/DriverRequestDTO";

export interface IRegisterDriverUseCase {
  execute(driverData: RegisterDriverRequest): Promise<{ message: string }>;
}
