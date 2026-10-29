import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { BookingStatus, Booking, BookingType } from "../../../domain/models/Booking"; 
import { IFareCalculatorService } from "../../services/FareCalculatorService"; 
import { Types } from "mongoose";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { IBookDriverUseCase } from "./interfaces/IBookDriverUseCase";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { GoogleDistanceService } from "../../services/GoogleDistanceService";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";

export interface BookDriverInput {
  userId: string;
  driverId?: string;
  fromLocation: string;
  toLocation?: string;
  startDate: Date;
  endDate?: Date;
  estimatedKm?: number;
  bookingType: BookingType;
  fromLat: number;
  fromLng: number;
}

@injectable()
export class BookDriver implements IBookDriverUseCase  {
  constructor(
    @inject(TOKENS.IBOOKING_REPO) private _bookingRepo: IBookingRepository,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepo: IDriverRepository,
    @inject(TOKENS.IFARE_CALCULATE_SERVICE) private _fareCalculator: IFareCalculatorService,
    @inject(TOKENS.NOTIFICATION_SERVICE) private _notificationService: INotificationService,
    @inject(TOKENS.GOOGLE_DISTANCE_SERVICE) private _distanceService: GoogleDistanceService
  ) {}

  async execute(data: BookDriverInput): Promise<Booking> {
    const { driverId, startDate, endDate, bookingType} = data;

    if (endDate && startDate > endDate) {
      throw new AuthError("End date must be greater than start date", HTTP_STATUS_CODES.BAD_REQUEST);
    }

    // Check availability only if a specific driver was requested
    if (driverId) {
      const isBooked = await this._bookingRepo.checkDriverAvailability(driverId, startDate, endDate);
      if (!isBooked) {
        throw new AuthError("Driver is already booked for the selected time.", HTTP_STATUS_CODES.BAD_REQUEST);
      }
    }

    const estimatedFare = this._fareCalculator.calculate({
      bookingType,
      estimatedKm: data.estimatedKm,
      startDate,
      endDate,
    });

    let targetedDriverIds: string[] = [];

    if (!driverId) {
      // 1. Find all approved, active-payment drivers within 30km straight-line radius
      console.log(data.fromLat, data.fromLng, "fromLat,fromLng")
      const nearbyDrivers = await this._driverRepo.findNearbyDriversWithinRadius(
        { latitude: data.fromLat, longitude: data.fromLng },
        [],
        30 // 30 km straight-line radius
      );
      console.log(nearbyDrivers, "nearbyDrivers")

      // 2. Query Google Maps Distance API to filter by road distance
      const driverLocations = nearbyDrivers.map((d) => ({
        id: d._id.toString(),
        latitude: d.latitude,
        longitude: d.longitude,
      }));

      if (driverLocations.length > 0) {
        const distances = await this._distanceService.getDistances(
          { latitude: data.fromLat, longitude: data.fromLng },
          driverLocations
        );

        // 3. Keep only drivers whose road distance is <= 20 km
        targetedDriverIds = nearbyDrivers
          .filter((d) => {
            const roadDist = distances[d._id.toString()];
            console.log(`[Matchmaking Filter] Driver ${d._id} road distance: ${roadDist} km`);
            return roadDist !== undefined && roadDist <= 20; // 20 km road distance limit
          })
          .map((d) => d._id.toString());
        console.log("🎯 final targetedDriverIds within 20km:", targetedDriverIds);
      }

      // If there are no drivers within 20km road distance, throw error
      if (targetedDriverIds.length === 0) {
        throw new AuthError("No drivers available within 20km road distance from your pickup location.", HTTP_STATUS_CODES.BAD_REQUEST);
      }
    }

    const newBooking: Booking = {
      userId: new Types.ObjectId(data.userId),
      ...(driverId && { driverId: new Types.ObjectId(driverId) }),
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      startDate: new Date(startDate),
      ...(endDate && { endDate: new Date(endDate) }),
      estimatedKm: data.estimatedKm,
      bookingType,
      estimatedFare,
      status: BookingStatus.PENDING,
      paymentMode: "stripe",
      fromLat: data.fromLat,
      fromLng: data.fromLng,
    };
   
    // Save booking
    const savedBooking = await this._bookingRepo.createBooking(newBooking);

    if (savedBooking.driverId) {
      await this._notificationService.sendBookingNotification(savedBooking.driverId.toString(), {
        bookingId: savedBooking._id?.toString() || savedBooking.id || "",
        fromLocation: savedBooking.fromLocation,
        toLocation: savedBooking.toLocation,
        estimatedFare: savedBooking.estimatedFare,
        startDate,
        newRide: savedBooking
      });
    } else {
      await this._notificationService.broadcastBookingNotification(targetedDriverIds, {
        bookingId: savedBooking._id?.toString() || savedBooking.id || "",
        fromLocation: savedBooking.fromLocation,
        toLocation: savedBooking.toLocation,
        estimatedFare: savedBooking.estimatedFare,
        startDate,
        newRide: savedBooking
      });
    }

    return savedBooking;
  }
}
