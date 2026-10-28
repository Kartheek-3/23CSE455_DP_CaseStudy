import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { protectRoute } from "../../middleware/authMiddleware";
import { TOKENS } from "../../constants/Tokens";
import { ROUTES } from "../../constants/Routes";


const router = Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
export const bookingController=container.resolve<BookingController>(TOKENS.BOOKING_CONTROLLER);
// Booking endpoint
router.post(ROUTES.BOOKING.SLOT,protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),bookingController.bookDriver.bind(bookingController));
router.post(ROUTES.BOOKING.ESTIMATE_FARE,protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getEstimatedFare.bind(bookingController));
router.patch(ROUTES.BOOKING.ACCEPT, protectRoute(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.acceptBooking.bind(bookingController));
export default router;
