import { container } from "tsyringe";
import BookingModel from "../database/modals/Bookingschema";
import { BookingStatus } from "../../domain/models/Booking";
import { INotificationService } from "../../application/services/NotificationService";
import { TOKENS } from "../../constants/Tokens";
import { Types } from "mongoose";

export class CronScheduler {
  static start() {
    console.log("[CronScheduler] Booking expiration scheduler started.");
    
    // Check every 30 seconds to catch expired bookings promptly
    setInterval(async () => {
      try {
        const limitMinutes = parseInt(process.env.BOOKING_EXPIRATION_LIMIT_MINUTES || "3", 10);
        const expirationTime = new Date(Date.now() - limitMinutes * 60 * 1000);
        
        // Find all pending bookings created more than the limit time ago
        const expiredBookings = await BookingModel.find({
          status: BookingStatus.PENDING,
          createdAt: { $lt: expirationTime }
        });

        if (expiredBookings.length === 0) return;

        const notificationService = container.resolve<INotificationService>(TOKENS.NOTIFICATION_SERVICE);

        for (const booking of expiredBookings) {
          booking.status = BookingStatus.EXPIRED;
          booking.reason = `No driver accepted the request within ${limitMinutes} minutes.`;
          await booking.save();

          // 1. Notify the user
          notificationService.rejectBookingNotification(booking.userId.toString(), {
            bookingId: (booking._id as Types.ObjectId).toString(),
            status: BookingStatus.EXPIRED,
            startDate: booking.startDate,
            reason: booking.reason
          });

          // 2. Dismiss request popup for all online drivers
          notificationService.bookingAssignedNotification((booking._id as Types.ObjectId).toString());
        }

        console.log(`[CronScheduler] Expired ${expiredBookings.length} pending booking(s).`);
      } catch (error) {
        console.error("[CronScheduler] Error running expiration cron:", error);
      }
    }, 30 * 1000);
  }
}
