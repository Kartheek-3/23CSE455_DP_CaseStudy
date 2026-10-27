export interface DriverReview {
  _id: string;
  driverId: string;
  userId: string;
  rideId: string;
  rating: number;     
  review?: string;
  createdAt: Date;
    user?: {
    _id: string;
    name: string;
    profile: string;
  };
}
