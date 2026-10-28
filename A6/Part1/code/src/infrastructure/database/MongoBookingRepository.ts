import { BookingWithUsername, IBookingRepository, PaginatedResult, rideHistory, RawDriverDashboardStats, RawAdminDashboardStats } from "../../domain/repositories/IBookingrepository"; 
import { Booking, paymentStatus } from "../../domain/models/Booking"; 
import BookingModel, { BookingDocument } from "./modals/Bookingschema"; 
import { injectable } from "tsyringe";
import { AuthError } from "../../domain/errors/Autherror";
import { STATUS_CODES } from "http";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import mongoose, { FilterQuery } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { PopulatedBooking } from "./interfaces/PopulatedBooking";

@injectable()
export class MongoBookingRepository extends BaseRepository<Booking, BookingDocument> implements IBookingRepository {
  constructor() {
    super(BookingModel);
  }

  async createBooking(booking: Booking): Promise<Booking> {
    return super.create(booking);
  }
  
  async findBookingById(id: string): Promise<Booking | null> {
    return super.findById(id);
  }

    async GetAllBookings(page: number, limit: number): Promise<PaginatedResult<BookingWithUsername>> {
      try {
       const skip = (page - 1) * limit;
    
      const [bookings, total] = await Promise.all([
        BookingModel.find()
          .populate("userId", "name profile") 
          .populate("driverId", "name profileImage") 
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        BookingModel.countDocuments(),
      ]);
    
      const formattedBookings: BookingWithUsername[] = bookings.map((b) => {
        const plain = b.toObject() as unknown as PopulatedBooking;
        return {
          ...plain,
          userId: plain.userId._id.toString(),
          driverId: plain.driverId?._id?.toString(),
          username: plain.userId?.name || "Unknown", 
          place: plain.place || "N/A", // safely access populated username
          drivername: plain.driverId?.name || "Unknown",
          driverImage: plain.driverId?.profileImage || "N/A", // safely access populated username
          userImage: plain.userId?.profile || "N/A", // safely access populated username
        } as unknown as BookingWithUsername;
      });
    
      return {
        data: formattedBookings,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
      } catch (error:any) {
        console.error('Error fetching all bookings:', error.message);
        throw new AuthError(`${error.message}`, 500);
        
      }
    }


  
    async findBookingsByDriver(
  driverId: string,
  page: number,
  limit: number
): Promise<PaginatedResult<rideHistory>> {
  const skip = (page - 1) * limit;
  const query: FilterQuery<BookingDocument> = {
    driverId,
    status: { $nin: ["CANCELLED", "REJECTED"] },
    paymentStatus: { $ne: "COMPLETED" },
  };

  const [bookings, total] = await Promise.all([
    BookingModel.find(query)
      .populate("userId", "name profile email place mobile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BookingModel.countDocuments(query),
  ]);

  const formattedBookings: rideHistory[] = bookings.map((b) => {
    const bookingObj = b.toObject() as unknown as PopulatedBooking; // Convert Mongoose document to plain object
    const user = bookingObj.userId;

    return {
      ...bookingObj,
      userId: user._id.toString(),
      driverId: bookingObj.driverId?._id?.toString(),
      name: user.name,
      place: user.place || "N/A",
      email: user.email,
      profile: user.profile || "N/A",
      mobile: user.mobile
    } as unknown as rideHistory;
  });

  return {
    data: formattedBookings,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

  
    async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
      return super.update(id, updates);
    }

      
  
    async checkDriverAvailability(driverId: string, start: Date, end?: Date): Promise<boolean> {
      // If no end date provided, assume it's a one-day booking
      try{
      const effectiveEnd = end || start;
    console.log(effectiveEnd);  
     
const conflict = await BookingModel.findOne({
  driverId,
  status: { $ne: "CANCELLED" },
  $or: [
    {
      // Booking has both startDate and endDate
      startDate: { $lte: effectiveEnd },
      endDate: { $gte: start },
    },
    {
      // Booking has only startDate (no endDate field present)
      startDate: { $eq: effectiveEnd },
      endDate: { $exists: false },
    },
  ],
});
   
      return !conflict;
    }
   catch (error:any) {
    // Optionally, use a logger here
    console.error(`Error checking driver availability for ${driverId}:`, error);

    // costome error handling
    throw new AuthError(`failed to check availability of driver ${error.message}`, 500);
  }
    
  
}
async findBookingsByUser(userId: string, page: number, limit: number): Promise<PaginatedResult<BookingWithUsername>> {
  try {
    const skip = (page - 1) * limit;
    const query: FilterQuery<BookingDocument> = {
      userId,
      status: { $nin: ["CANCELLED", "REJECTED"] },
      paymentStatus: { $ne: "COMPLETED" },
      $or: [
        { status: { $ne: "EXPIRED" } },
        { status: "EXPIRED", userAcknowledged: { $ne: true } }
      ]
    };
    const [bookings, total] = await Promise.all([
      BookingModel.find(query)
        .populate("userId", "name") 
        .populate("driverId", "name profileImage mobile")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BookingModel.countDocuments(query),
    ]);
  
    const formattedBookings: BookingWithUsername[] = bookings.map((b) => {
      const plain = b.toObject() as unknown as PopulatedBooking;
      return {
        ...plain,
        userId: plain.userId._id.toString(),
        driverId: plain.driverId?._id?.toString(),
        username: plain.userId?.name || "Unknown", 
        place: plain.place || "N/A", // safely access populated username
        drivername: plain.driverId?.name || "Unknown",
        driverImage: plain.driverId?.profileImage || "N/A", // safely access populated username
      } as unknown as BookingWithUsername;
    });
  
    return {
      data: formattedBookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err: any) {
    console.error("MongoBookingRepository.findBookingsByUser error:", err);
    throw new AuthError(`Failed to fetch user bookings. ${err.message}`, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}
async getRideHistoryByRole(
  id: string,
  role: 'user' | 'driver',
  page: number,
  limit: number
): Promise<PaginatedResult<rideHistory>> {
  try {
    const skip = (page - 1) * limit;

    // Step 1: Construct dynamic query
    const query: FilterQuery<BookingDocument> = {
      $or: [
        { status: { $in: ["CANCELLED", "REJECTED", "EXPIRED"] } },
        { paymentStatus: "COMPLETED" },
      ],
    };

    if (role === "user") {
      query.userId = id;
    } else if (role === "driver") {
      query.driverId = id;
    }

  
    // Step 2: Determine which field to populate
    const populateField = role === "user" ? "driverId":"userId" ;
    const projection = role === "user" ?  "name email profileImage place":"name email profile place" 
    const total = await BookingModel.countDocuments(query);

    const rides = await BookingModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate(populateField,projection)
      .lean();

    // Step 3: Transform based on role
    const transformed: rideHistory[] = rides.map((b) => {
      const populatedRide = b as unknown as PopulatedBooking;
      if (role === "user") {
        const driver = populatedRide.driverId;
        return {
          ...b,
          userId: populatedRide.userId._id.toString(),
          driverId: driver?._id?.toString(),
          email: driver?.email,
          place: driver?.place || "N/A",
          name: driver?.name || "Unknown",
          profile: driver?.profileImage || "N/A",
        } as unknown as rideHistory;
      } else {
        const user = populatedRide.userId;
        return {
          ...b,
          userId: user._id.toString(),
          driverId: populatedRide.driverId?._id?.toString(),
          email: user.email,
          place: user.place || "N/A",
          name: user.name,
          profile: user.profile || "N/A",
        } as unknown as rideHistory;
      }
    });

    return {
      data: transformed,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error: any) {
    console.log(error.message);
    throw new AuthError(
      `Failed to fetch ${role} ride history. ${error.message}`,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
  }
}
async countBookingsByStatus(driverId: string, year?: number, month?: number): Promise<Record<string, number>> {
    try {
      const matchStage: FilterQuery<BookingDocument> = {
      driverId: new mongoose.Types.ObjectId(driverId)
    };

    if (year) {
      matchStage.$expr = {
        $eq: [{ $year: "$startDate" }, year]
      };
    }

    if (year && month) {
      matchStage.$expr = {
        $and: [
          { $eq: [{ $year: "$startDate" }, year] },
          { $eq: [{ $month: "$startDate" }, month] }
        ]
      };
    }

    const result = await BookingModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const summary: Record<string, number> = {};
    result.forEach((r) => {
      summary[r._id] = r.count;
    });

    return summary;
  
    } catch (error: any) {
      console.error('Error in countBookingsByStatus:', error.message);
      throw new AuthError('Failed to fetch booking status summary', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR); 
    }
  }

  async  getDriverEarningsByMonth(driverId: string, year: number, month?: number): Promise<{
    chartData: { label: string; totalEarnings: number }[];
    totalEarnings: number;
    totalRides: number;
  }> {
    try {
      const matchStage: FilterQuery<BookingDocument> = {
      driverId: new mongoose.Types.ObjectId(driverId),
      paymentStatus: 'COMPLETED'
    };

    if (month) {
      matchStage.$expr = {
        $and: [
          { $eq: [{ $year: "$startDate" }, year] },
          { $eq: [{ $month: "$startDate" }, month] }
        ]
      };
    } else {
      matchStage.$expr = {
        $eq: [{ $year: "$startDate" }, year]
      };
    }

    const groupStage = month
      ? {
          _id: { $dayOfMonth: "$startDate" },
          total: { $sum: "$driver_fee" },
          count: { $sum: 1 }
        }
      : {
          _id: { $month: "$startDate" },
          total: { $sum: "$driver_fee" },
          count: { $sum: 1 }
        };

    const result = await BookingModel.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } }
    ]);

    const chartData = result.map((r) => ({
      label: r._id.toString(),
      totalEarnings: r.total
    }));

    const totalEarnings = result.reduce((sum, r) => sum + r.total, 0);
    const totalRides = result.reduce((sum, r) => sum + r.count, 0);

    return { chartData, totalEarnings, totalRides };
    } catch (error: any) {
      console.error('Error in getDriverEarningsByMonth:', error.message);
      throw new AuthError('Failed to fetch earnings summary', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async getDriverDashboardStats(driverId: string): Promise<RawDriverDashboardStats> {
    try {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const weekStart = new Date(now);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);

      const result = await BookingModel.aggregate([
        { $match: { driverId: new mongoose.Types.ObjectId(driverId) } },
        {
          $facet: {
            earnings: [
              { $match: { paymentStatus: 'COMPLETED' } },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$driver_fee" },
                  today: {
                    $sum: {
                      $cond: [
                        { $gte: ["$createdAt", todayStart] },
                        "$driver_fee",
                        0
                      ]
                    }
                  },
                  thisWeek: {
                    $sum: {
                      $cond: [
                        { $gte: ["$createdAt", weekStart] },
                        "$driver_fee",
                        0
                      ]
                    }
                  }
                }
              }
            ],
            rideStats: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]);

      return (result[0] || { earnings: [], rideStats: [] }) as RawDriverDashboardStats;
    } catch (error: any) {
      console.error('Error in getDriverDashboardStats:', error.message);
      throw new AuthError('Failed to fetch dashboard stats', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  async getAdminDashboardStats(): Promise<RawAdminDashboardStats> {
    try {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const result = await BookingModel.aggregate([
        {
          $facet: {
            finance: [
              { $match: { paymentStatus: 'COMPLETED' } },
              {
                $group: {
                  _id: null,
                  totalPlatformProfit: { $sum: "$platform_fee" },
                  totalRevenue: { $sum: "$finalFare" },
                  totalDriverPayout: { $sum: "$driver_fee" },
                  todayPlatformProfit: {
                    $sum: {
                      $cond: [
                        { $gte: ["$createdAt", startOfToday] },
                        "$platform_fee",
                        0
                      ]
                    }
                  },
                  weekPlatformProfit: {
                    $sum: {
                      $cond: [
                        { $gte: ["$createdAt", startOfWeek] },
                        "$platform_fee",
                        0
                      ]
                    }
                  }
                }
              }
            ],
            rideStats: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              }
            ],
            earningsTrend: [
              { $match: { paymentStatus: 'COMPLETED' } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  earnings: { $sum: "$platform_fee" }
                }
              },
              { $sort: { _id: 1 } },
              { $limit: 30 }
            ]
          }
        }
      ]);

      return result[0] as RawAdminDashboardStats;
    } catch (error: any) {
      console.error('Error in getAdminDashboardStats:', error.message);
      throw new AuthError('Failed to fetch admin dashboard stats', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}