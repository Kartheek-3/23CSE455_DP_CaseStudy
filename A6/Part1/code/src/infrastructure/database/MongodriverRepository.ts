import { injectable } from "tsyringe";
import { IDriverRepository } from "../../domain/repositories/IDriverepository";
import { Driver } from "../../domain/models/Driver";
import DriverModel, { IDriver } from "./modals/Driverschema"; // MongoDB Schema
import { isValidObjectId, Types, PipelineStage, FilterQuery } from "mongoose";
import { AuthError } from "../../domain/errors/Autherror";
import { ConflictError } from "../../domain/errors/ConflictError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { PaginatedResult } from "../../domain/repositories/IBookingrepository";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class MongoDriverRepository extends BaseRepository<Driver, IDriver> implements IDriverRepository {
  constructor() {
    super(DriverModel);
  }

  async create(driver: Driver): Promise<Driver> {
    try {
      let geoDriver = { ...driver };

      if ("latitude" in driver.location && "longitude" in driver.location) {
        geoDriver.location = {
          type: "Point",
          coordinates: [driver.location.longitude, driver.location.latitude],
        };
      }

      const newDriver = new DriverModel(geoDriver);
      const savedDriver = await newDriver.save();
      return savedDriver.toObject() as Driver;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError("Driver with this email already exists");
      }
      throw error;
    }
  }

  async update(driverId: string, data: Partial<Driver>): Promise<Driver | null> {
    try {
      if (!isValidObjectId(driverId)) {
        throw new AuthError("Invalid driver ID", HTTP_STATUS_CODES.BAD_REQUEST);
      }

      const driver = await DriverModel.findById(driverId);
      if (!driver) return null;

      if (
        data.location &&
        "latitude" in data.location &&
        "longitude" in data.location
      ) {
        const loc = data.location as { latitude: number; longitude: number };
        data.location = {
          type: "Point",
          coordinates: [loc.longitude, loc.latitude],
        };
      }

      Object.assign(driver, data);
      await driver.save();

      return driver.toObject() as Driver;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError("Driver with this email already exists");
      }
      throw error;
    }
  }
    
  async findDriverById(driverId: string): Promise<Driver | null> {
    try {
      return await DriverModel.findById(driverId)
      .select("-createdAt -updatedAt -__v")
      .lean() as Driver | null;
    
    } catch (error) {
      console.error("Error finding driver by ID:", error);
      return null;
    }
  }
  async findByEmail(email: string): Promise<Driver | null> {
    return super.findOne({ email });
  }

  async updateStatus(
    driverId: string,
    status: "pending" | "approved" | "rejected",
    reason?: string
  ): Promise<Driver | null> {
    const updateData: Partial<Driver> = { status };
    if (status === "rejected" && reason) {
      updateData.reason = reason;
    } else {
      updateData.reason = undefined;
    }
    
    return super.update(driverId, updateData);
  }

  async blockOrUnblockDriver(driverId: string, isBlock: boolean): Promise<void> {
    await super.update(driverId, { isBlock });
  }
 
  async getDrivers(page: number, limit: number): Promise<PaginatedResult<Driver>> {
    const skip = (page - 1) * limit;

    const aggregationPipeline: PipelineStage[] = [
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } }, // Assuming recent drivers first
            { $skip: skip },
            { $limit: limit }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ];

    const result = await DriverModel.aggregate(aggregationPipeline);

    const data = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as Driver[],
      total,
      page,
      totalPages
    };
  }
  async findActiveDrivers(
  page: number,
  limit: number,
  placeKey?: string,
  lat?: number,
  lng?: number
): Promise<PaginatedResult<Driver>> {
  const skip = (page - 1) * limit;

  const matchStage: FilterQuery<IDriver> = {
    status: "approved",
    activePayment: true
  };

  const trimmedPlaceKey = placeKey?.trim();
  if (trimmedPlaceKey) {
    matchStage.place = { $regex: trimmedPlaceKey, $options: "i" };
  }

  const aggregationPipeline: PipelineStage[] = [];

  if (lat !== undefined && lng !== undefined) {
    aggregationPipeline.push({
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distance",
        maxDistance: 20000, // 20km equivalent in meters
        spherical: true,
        query: matchStage
      }
    });
  } else {
    aggregationPipeline.push({ $match: matchStage });
  }

  aggregationPipeline.push({
    $facet: {
      data: [
        { $project: {
            _id: 1,             
            name: 1,
            profileImage: 1,
            place: 1,
            location:1,
            averageRating:1,
            distance:1 // Include distance from $geoNear if present
        }},
        { $skip: skip },
        { $limit: limit }
      ],
      totalCount: [
        { $count: "count" }
      ]
    }
  });

  const result = await DriverModel.aggregate(aggregationPipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: data as Driver[],
    total,
    page,
    totalPages
  };
}


async updateStripeAccount(driverId: string, stripeAccountId: string): Promise<Driver> {
  try {
    const driver = await DriverModel.findById(driverId);

    if (!driver) {
      throw new AuthError('Driver not found', 404);
    }

    driver.stripeAccountId = stripeAccountId;
    await driver.save();

    return { ...driver.toObject(), _id: driver._id } as Driver;
  } catch (error: any) {
    console.error('Failed to update Stripe account for driver:', error);
    throw new AuthError('Failed to update Stripe account', 500);
  }
}


async updateRatingStats(driverId: string, stats: {
  totalRatingPoints: number;
  totalRatings: number;
  averageRating: number;
}): Promise<void> {
  await super.update(driverId, {
    $set: {
      totalRatingPoints: stats.totalRatingPoints,
      totalRatings: stats.totalRatings,
      averageRating: stats.averageRating,
    },
  });
}

async findNearbyDriversWithinRadius(
  location: { latitude: number; longitude: number },
  excludedDriverIds: string[],
  radiusInKm: number
): Promise<{ _id: string; latitude: number; longitude: number }[]> {
  try {
    const radiusInMeters = radiusInKm * 1000;

    const excludedObjectIds = excludedDriverIds
      .filter(isValidObjectId)
      .map((id) => new Types.ObjectId(id));

    const result = await DriverModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude],
          },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
          query: {
            _id: { $nin: excludedObjectIds },
            isBlock: false,
            status: 'approved',
            activePayment: true,
          },
        },
      },
      {
        $project: {
          _id: 1,
          latitude: { $arrayElemAt: ['$location.coordinates', 1] },
          longitude: { $arrayElemAt: ['$location.coordinates', 0] },
        },
      },
    ]);

    return result;
  } catch (error) {
    console.error('❌ Error in findNearbyDriversWithinRadius:', error);
    throw new AuthError('Failed to find nearby drivers', HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

}

