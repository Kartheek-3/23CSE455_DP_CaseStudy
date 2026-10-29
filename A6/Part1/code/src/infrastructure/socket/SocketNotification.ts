// src/infrastructure/socket/SocketNotification.ts
import { Socket } from "socket.io";
import { getIO } from "./socket";
import { redis } from "../../config/redisconfig";
import { container } from "tsyringe";
import { TOKENS } from "../../constants/Tokens";
import { GoogleDistanceService } from "../../application/services/GoogleDistanceService";
import BookingModel from "../database/modals/Bookingschema";
import DriverModel from "../database/modals/Driverschema";
import { BookingStatus } from "../../domain/models/Booking";
import { Types } from "mongoose";

export const NotificationSocket = () => {
  const io = getIO();

  io.on("connection", (socket: Socket) => {
 
    socket.on("driver:online", async(driverId: string) => {
      await redis.set(`driver:socket:${driverId}`, socket.id);
      await redis.set(`socket:driver:${socket.id}`, driverId);

      try {
        // 1. Fetch driver profile to get coordinates
        const driver = await DriverModel.findById(driverId);
        if (!driver || !driver.location) return;

        let driverLng: number;
        let driverLat: number;

        if ("coordinates" in driver.location) {
          [driverLng, driverLat] = driver.location.coordinates;
        } else {
          driverLng = driver.location.longitude;
          driverLat = driver.location.latitude;
        }

        // 2. Fetch all active pending broadcast bookings
        const pendingBookings = await BookingModel.find({
          status: BookingStatus.PENDING,
          driverId: null
        });

        if (pendingBookings.length === 0) return;

        const distanceService = container.resolve<GoogleDistanceService>(TOKENS.GOOGLE_DISTANCE_SERVICE);

        // Prepare locations (booking starting locations)
        const bookingLocations = pendingBookings
          .filter(b => b.fromLat !== undefined && b.fromLng !== undefined)
          .map(b => ({
            id: (b._id as Types.ObjectId).toString(),
            latitude: b.fromLat!,
            longitude: b.fromLng!
          }));

        if (bookingLocations.length === 0) return;

        // Calculate road distances from the driver's location to the bookings' pickup coordinates
        const distances = await distanceService.getDistances(
          { latitude: driverLat, longitude: driverLng },
          bookingLocations
        );

        // Emit booking:new to this driver for all bookings <= 20 km
        for (const booking of pendingBookings) {
          const roadDist = distances[(booking._id as Types.ObjectId).toString()];
          console.log(`[Catch-Up Check] Booking ${(booking._id as Types.ObjectId).toString()} is ${roadDist} km away from Driver ${driverId}`);
          if (roadDist !== undefined && roadDist <= 20) {
            console.log(`📣 Emitting catch-up notification to Driver ${driverId} for Booking ${(booking._id as Types.ObjectId).toString()}`);
            socket.emit("booking:new", {
              bookingId: (booking._id as Types.ObjectId).toString(),
              fromLocation: booking.fromLocation,
              toLocation: booking.toLocation,
              estimatedFare: booking.estimatedFare,
              startDate: booking.startDate,
              newRide: booking
            });
          }
        }
      } catch (error) {
        console.error("[SocketNotification] Error catching up offline driver:", error);
      }
    });

    socket.on("user:online",async ({userId}) => {
      await redis.set(`user:socket:${userId}`, socket.id);
      await redis.set(`socket:user:${socket.id}`, userId);
      console.log('user is online');
    });

    socket.on("disconnect",async () => {
      const driverId = await redis.get<string>(`socket:driver:${socket.id}`);
      if (driverId) {
        await redis.del(`driver:socket:${driverId}`);
        await redis.del(`socket:driver:${socket.id}`);
        console.log(`Driver ${driverId} disconnected`);
      }
    
      // Try to clean up user socket
      const userId = await redis.get<string>(`socket:user:${socket.id}`);
      if (userId) {
        await redis.del(`user:socket:${userId}`);
        await redis.del(`socket:user:${socket.id}`);
        console.log(`User ${userId} disconnected`);
      }
    });
  });
};
