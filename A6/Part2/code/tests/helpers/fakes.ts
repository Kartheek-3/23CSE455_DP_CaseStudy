// In-memory test doubles so the use cases run without MongoDB, Redis, Stripe or Google Maps.
import { Types } from "mongoose";
import { Booking, BookingStatus, BookingType } from "../../src/domain/models/Booking";
import { Driver } from "../../src/domain/models/Driver";

export const id = () => new Types.ObjectId().toString();

export function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    _id: id(),
    userId: new Types.ObjectId(),
    fromLocation: "Kochi",
    toLocation: "Aluva",
    startDate: new Date("2026-12-01T04:30:00.000Z"),
    estimatedKm: 30,
    estimatedFare: 450,
    bookingType: BookingType.ONE_WAY,
    status: BookingStatus.PENDING,
    paymentMode: "stripe",
    fromLat: 10.0,
    fromLng: 76.3,
    ...overrides,
  };
}

export function makeDriver(overrides: Partial<Driver> = {}): Driver {
  return {
    _id: id(),
    name: "Test Driver",
    email: "driver@example.test",
    mobile: "9000000000",
    password: "hashed",
    profileImage: "",
    location: { type: "Point", coordinates: [76.3, 10.0] },
    place: "Kochi",
    aadhaarNumber: "000000000000",
    licenseNumber: "KL0000000000",
    aadhaarImage: "",
    licenseImage: "",
    status: "approved",
    isBlock: false,
    role: "driver",
    onlineStatus: "online",
    lastSeen: new Date(),
    averageRating: 0,
    totalRatings: 0,
    totalRatingPoints: 0,
    ...overrides,
  } as Driver;
}

export class FakeBookingRepo {
  bookings = new Map<string, Booking>();
  updates: { id: string; changes: Partial<Booking> }[] = [];

  seed(b: Booking) {
    this.bookings.set(String(b._id), { ...b });
    return b;
  }
  async createBooking(b: Booking) {
    const saved = { ...b, _id: id() };
    this.bookings.set(String(saved._id), saved);
    return saved;
  }
  async findBookingById(bookingId: string) {
    return this.bookings.get(bookingId) ?? null;
  }
  async updateBooking(bookingId: string, changes: Partial<Booking>) {
    this.updates.push({ id: bookingId, changes });
    const cur = this.bookings.get(bookingId);
    if (!cur) return null;
    const next = { ...cur, ...changes };
    this.bookings.set(bookingId, next);
    return next;
  }
  async checkDriverAvailability() {
    return true;
  }
  // Used from CH01 onwards (AcceptBooking no longer queries the Mongoose model directly).
  async acceptPendingBooking(bookingId: string, driverId: string) {
    const cur = this.bookings.get(bookingId);
    if (!cur || cur.status !== BookingStatus.PENDING) return null;
    const next = { ...cur, status: BookingStatus.CONFIRMED, driverId: new Types.ObjectId(driverId) };
    this.bookings.set(bookingId, next);
    return next;
  }
}

export class FakeDriverRepo {
  drivers = new Map<string, Driver>();
  nearby: { _id: string; latitude: number; longitude: number }[] = [];
  statusCalls: { driverId: string; status: string; reason?: string }[] = [];

  seed(d: Driver) {
    this.drivers.set(String(d._id), { ...d });
    return d;
  }
  async findDriverById(driverId: string) {
    return this.drivers.get(driverId) ?? null;
  }
  async findNearbyDriversWithinRadius() {
    return this.nearby;
  }
  async updateStatus(driverId: string, status: any, reason?: string) {
    this.statusCalls.push({ driverId, status, reason });
    const cur = this.drivers.get(driverId);
    if (!cur) return null;
    const next = { ...cur, status, reason } as Driver;
    this.drivers.set(driverId, next);
    return next;
  }
}

/** Records every notification call: [methodName, recipientId, payload]. */
export class FakeNotifier {
  calls: [string, string | undefined, any][] = [];
  private rec(name: string) {
    return async (who?: any, data?: any) => {
      this.calls.push([name, Array.isArray(who) ? who.join(",") : who, data]);
    };
  }
  sendBookingNotification = this.rec("sendBookingNotification");
  broadcastBookingNotification = this.rec("broadcastBookingNotification");
  cancelBookingNotification = this.rec("cancelBookingNotification");
  paymentNotification = this.rec("paymentNotification");
  bookingAssignedNotification = this.rec("bookingAssignedNotification") as any;
  sendBookingConfirmation = this.rec("sendBookingConfirmation");
  rejectBookingNotification = this.rec("rejectBookingNotification");
  adminChangeDriverStatusNotification = this.rec("adminChangeDriverStatusNotification");
  driverCancelledBookingNotification = this.rec("driverCancelledBookingNotification");
  names() {
    return this.calls.map((c) => c[0]);
  }
}

/** Road distances keyed by driver id. */
export class FakeDistance {
  constructor(public km: Record<string, number> = {}) {}
  async getDistances() {
    return this.km;
  }
}
