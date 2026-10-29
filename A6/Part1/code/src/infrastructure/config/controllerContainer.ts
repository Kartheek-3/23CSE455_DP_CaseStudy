import { container } from "tsyringe";
import { UserController } from "../../presentation/controllers/UserController";
import { TOKENS } from "../../constants/Tokens";
import { DriverController } from "../../presentation/controllers/DriverControler";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { BookingController } from "../../presentation/controllers/BookingController";
import { AdminController } from "../../presentation/controllers/AdminController";
import { AuthController } from "../../presentation/controllers/AuthController";

container.registerSingleton<UserController>(TOKENS.USER_CONTROLLER, UserController);
container.registerSingleton<DriverController>(USECASE_TOKENS.DRIVER_CONTROLLER,DriverController)
container.registerSingleton<BookingController>(TOKENS.BOOKING_CONTROLLER,BookingController);
container.registerSingleton<AdminController>(TOKENS.ADMIN_CONTROLLER,AdminController);
container.registerSingleton<AuthController>(TOKENS.AUTH_CONTROLLER,AuthController)