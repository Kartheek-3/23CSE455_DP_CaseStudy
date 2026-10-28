export interface IGoogleMapService {
 
  calculateRoadDistances(
    origin: { latitude: number; longitude: number },
    destinations: { driverId: string; latitude: number; longitude: number }[]
  ): Promise<{ driverId: string; distanceInKm: number }[]>;
    getClosestDriverByRoadDistance(
    origin: { latitude: number; longitude: number },
    destinations: { driverId: string; latitude: number; longitude: number }[]
  ): Promise<{ driverId: string; distanceInKm: number } | null>;
}
