import express from "express";
import { AdminController } from "../controllers/AdminController";
import { protectRoute } from "../../middleware/authMiddleware";
import { BookingController } from "../controllers/BookingController";
import { container } from "tsyringe";
import { TOKENS } from "../../constants/Tokens";
import { ROUTES } from "../../constants/Routes";


const router = express.Router();
 const bookingController=container.resolve<BookingController>(TOKENS.BOOKING_CONTROLLER);
const adminController=container.resolve<AdminController>(TOKENS.ADMIN_CONTROLLER)
router.post(ROUTES.ADMIN.LOGIN, adminController.login.bind(adminController));
router.get(ROUTES.ADMIN.DASHBOARD, protectRoute(["admin"]), adminController.getDashboardStats.bind(adminController));

// User Management
router
  .route(ROUTES.ADMIN.USER.BASE)
  .get(protectRoute(["admin"]), adminController.getAllUsers.bind(adminController));

router
  .route(ROUTES.ADMIN.USER.UPDATE_STATUS)
  .put(protectRoute(["admin"]), adminController.updateUserStatus.bind(adminController));

// Driver Management
router
  .route(ROUTES.ADMIN.DRIVER.BASE)
  .get(protectRoute(["admin"]), adminController.getAllDrivers.bind(adminController))

  router
  .route(ROUTES.ADMIN.DRIVER.STATUS)
  .put(protectRoute(["admin"]), adminController.changeDriverStatus.bind(adminController));

router
  .route(ROUTES.ADMIN.DRIVER.BLOCK_STATUS)
  .patch(protectRoute(["admin"]),adminController.handleBlockStatus.bind(adminController));

// Vehicle Management
router
  .route(ROUTES.ADMIN.VEHICLES_BY_USER)
  .get(protectRoute(["admin"]), adminController.getVehiclesByUser.bind(adminController));

  router.get(ROUTES.ADMIN.BOOKINGS, bookingController.getAllBookings.bind(bookingController));
export default router;










