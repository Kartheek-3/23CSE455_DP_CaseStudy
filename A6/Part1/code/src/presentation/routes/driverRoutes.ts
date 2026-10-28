import express from "express";
import { DriverController } from "../controllers/DriverControler";
import { protectRoute } from "../../middleware/authMiddleware";
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";
import { AuthController } from "../controllers/AuthController";
import { BookingController } from "../controllers/BookingController";

import { TOKENS } from "../../constants/Tokens";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { authController } from "./AuthRoute";
import { ROUTES } from "../../constants/Routes";
const router = express.Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
export const bookingController=container.resolve<BookingController>(TOKENS.BOOKING_CONTROLLER);
const driverController=container.resolve<DriverController>(USECASE_TOKENS.DRIVER_CONTROLLER);
router
  .post(ROUTES.DRIVER.REGISTER, driverController.registerDriver.bind(driverController))
  .post(ROUTES.DRIVER.VERIFY_OTP, driverController.verifyOTPDriver.bind(driverController))
  .post(ROUTES.DRIVER.RESEND_OTP, driverController.resendOTP.bind(driverController))
  .post(ROUTES.DRIVER.LOGIN, driverController.login.bind(driverController));

  router
  .route(ROUTES.DRIVER.PROFILE.BASE)
  .all(protectRoute(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
  .get(driverController.getDriverProfile.bind(driverController));

router
  .route(ROUTES.DRIVER.PROFILE.BY_ID)
  .all(protectRoute(["driver"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Apply to all methods
  .put(driverController.editDriverProfile.bind(driverController))
 

  router
    .get(ROUTES.DRIVER.RIDE_HISTORY, 
      protectRoute(["driver"]), 
      checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
     bookingController.getRideHistory.bind(bookingController)
    ).patch(ROUTES.DRIVER.CHANGE_PASSWORD,
      protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      authController.ChangePassword.bind(authController))

      .post(ROUTES.DRIVER.ONBOARD,
        protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        driverController.onboardDriver.bind(driverController)
      )
       .get(ROUTES.DRIVER.BOOKINGS,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       
        driverController.getBookingsForDriver.bind(driverController))
       .patch(ROUTES.DRIVER.BOOKING_STATUS,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        bookingController.updateStatus.bind(bookingController))

        .post(ROUTES.DRIVER.VERIFY_ACCOUNT,
          protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
          driverController.verifyAccount.bind(driverController)
        ).get(ROUTES.DRIVER.CHAT.BASE,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
        bookingController.getChatByBookingId.bind(bookingController)
        ).delete(ROUTES.DRIVER.CHAT.MESSAGE,
        protectRoute(['driver']),
         checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       bookingController.deleteMessage.bind(bookingController)
         ).
        post(ROUTES.DRIVER.CHAT.SIGNATURE,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
         bookingController.getChatSignature.bind(bookingController)
        ).get(ROUTES.DRIVER.USER_BY_ID,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       driverController.getUserById.bind(driverController)
        ).get(ROUTES.DRIVER.REVIEW_BY_ID,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
       bookingController.ReviewDriver.bind(bookingController)
        )
 

.get(ROUTES.DRIVER.DASHBOARD.STATUS_SUMMARY,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getDriverBookingStatusSummary.bind(bookingController));
router.get(ROUTES.DRIVER.DASHBOARD.EARNINGS_SUMMARY,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getDriverEarningsByMonth.bind(bookingController));
router.get(ROUTES.DRIVER.DASHBOARD.BASE,protectRoute(['driver']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), bookingController.getDriverDashboard.bind(bookingController));

export default router;
