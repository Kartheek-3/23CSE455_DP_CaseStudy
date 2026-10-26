import express from "express";

import { protectRoute } from "../../middleware/authMiddleware"; 
import { CheckBlockedUserOrDriver } from "../../middleware/checkBlocked";
import { container } from "tsyringe";

import { BookingController } from "../controllers/BookingController";
import { UserController } from "../controllers/UserController";
import { ROUTES } from "../../constants/Routes";
import { TOKENS } from "../../constants/Tokens";
import { authController } from "./AuthRoute";


const router= express.Router();
const checkBlockedMiddleware = container.resolve(CheckBlockedUserOrDriver);
export const userController = container.resolve<UserController>(TOKENS.USER_CONTROLLER);
export const bookingController=container.resolve<BookingController>(TOKENS.BOOKING_CONTROLLER);
// Authentication Routes
router
  .post(ROUTES.USER.REGISTER, userController.register.bind(userController))
  .post(ROUTES.USER.VERIFY_OTP, userController.verifyOTPUser.bind(userController))
  .post(ROUTES.USER.RESEND_OTP, userController.resendOTP.bind(userController))
  .post(ROUTES.USER.LOGIN,userController.login.bind(userController));

// Vehicle Routes (Protected)
router
  .route(ROUTES.USER.VEHICLE.BASE)
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) 
  .post(userController.addVehicle.bind(userController))
  .get(userController.getAllVehicle.bind(userController));

router
  .route(ROUTES.USER.VEHICLE.BY_ID)
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware)) // Ensures protection for all requests to this route
  .put(userController.editVehicle.bind(userController))

  router
  .route(ROUTES.USER.PROFILE.BASE)
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
  .get(userController.getUserData.bind(userController))
   

router
  .route(ROUTES.USER.PROFILE.BY_ID)
  .all(protectRoute(["user"]), checkBlockedMiddleware.handle.bind(checkBlockedMiddleware))
  .patch(userController.updateUser.bind(userController))
   


router.get(ROUTES.USER.NEARBY,protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),userController.fetchDrivers.bind(userController))
.get(ROUTES.USER.DRIVER_DETAILS,protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),userController.getDriverDetails.bind(userController))

;

router.patch(ROUTES.USER.CHANGE_PASSWORD,protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),authController.ChangePassword.bind(authController))

//Booking Routes
router
  .route(ROUTES.USER.BOOK_SLOT)
  .post(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.bookDriver.bind(bookingController)
  )
  .get(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     bookingController.getUserBookings.bind(bookingController)
  );


router
  .route(ROUTES.USER.ESTIMATE_FARE)
  .post(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.getEstimatedFare.bind(bookingController)
  );
router
  .route(ROUTES.USER.UPDATE_BOOKING)
  .patch(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.attachPaymentIntent.bind(bookingController)
  );
router
  .route(ROUTES.USER.RIDE_HISTORY)
  .get(
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.getRideHistory.bind(bookingController)
  );



router
  .post(ROUTES.USER.PAYMENT_INTENT, 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    userController.createPaymentIntent.bind(userController)
  )
  .patch(ROUTES.USER.CANCEL_BOOKING, 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
     bookingController.cancelBooking.bind(bookingController)
  )
  .get(ROUTES.USER.CHAT.BASE, 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    bookingController.getChatByBookingId.bind(bookingController)
  )
  .delete(ROUTES.USER.CHAT.MESSAGE,
    protectRoute(['user']),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.deleteMessage.bind(bookingController)
  )
  .post(ROUTES.USER.CHAT.SIGNATURE, 
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware), 
    bookingController.getChatSignature.bind(bookingController)
  ).get(ROUTES.USER.GET_DRIVER_BY_ID,
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
   userController.getDriverById.bind(userController)
  ).get(ROUTES.USER.WALLET.BASE,
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
     userController.WalletTransaction.bind(userController) 
  ).get(ROUTES.USER.WALLET.BALANCE,
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      bookingController.WalletBalance.bind(bookingController)
  ).post(ROUTES.USER.WALLET.RIDE_PAYMENT,
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
      bookingController.WalletPayment.bind(bookingController) 
  ).post(ROUTES.USER.REVIEW.BASE,
    protectRoute(["user"]), 
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    userController.submitReview.bind(userController)
  ).get(ROUTES.USER.REVIEW.BY_ID,
    protectRoute(['user']),checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.ReviewDriver.bind(bookingController) )
  .patch(ROUTES.USER.ACKNOWLEDGE_BOOKING,
    protectRoute(["user"]),
    checkBlockedMiddleware.handle.bind(checkBlockedMiddleware),
    bookingController.acknowledgeBooking.bind(bookingController)
  )

  
export default router; 