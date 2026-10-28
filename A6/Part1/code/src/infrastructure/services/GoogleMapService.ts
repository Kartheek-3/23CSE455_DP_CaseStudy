import axios, { AxiosError } from 'axios';
import { injectable } from 'tsyringe';
import { IGoogleMapService } from '../../domain/services/IGoogleMapService';
import { AuthError } from '../../domain/errors/Autherror';
import { HTTP_STATUS_CODES } from '../../constants/HttpStatusCode';
import { ERROR_MESSAGES } from '../../constants/ErrorMessages';

@injectable()
export class GoogleMapService implements IGoogleMapService {
  private readonly apiUrl = process.env.GOOGLEMAP_API_URL!;
  private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY!;

  async calculateRoadDistances(
    origin: { latitude: number; longitude: number },
    destinations: { driverId: string; latitude: number; longitude: number }[]
  ): Promise<{ driverId: string; distanceInKm: number }[]> {
    try {
      if (destinations.length === 0) return [];

      const originParam = `${origin.latitude},${origin.longitude}`;
      const destinationParam = destinations
        .map((d) => `${d.latitude},${d.longitude}`)
        .join('|');

      const response = await axios.get(this.apiUrl, {
        params: {
          origins: originParam,
          destinations: destinationParam,
          key: this.apiKey,
        },
      });

      const elements = response.data.rows[0]?.elements;

      if (!elements || elements.length !== destinations.length) {
        throw new AuthError(ERROR_MESSAGES.GOOGLE_MAPS_API_ERROR, HTTP_STATUS_CODES.BAD_REQUEST);
      }

      return destinations.map((dest, index) => {
        const distanceMeters = elements[index]?.distance?.value ?? 0;
        const distanceKm = distanceMeters / 1000;
        return {
          driverId: dest.driverId,
          distanceInKm: distanceKm,
        };
      });
    } catch (err) {
    
        const error = err as AxiosError;

      console.error('❌ Google Maps API Error:', error.message);
      throw new AuthError(
        ERROR_MESSAGES.GOOGLE_MAPS_API_ERROR,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }
  }
  async getClosestDriverByRoadDistance(
  origin: { latitude: number; longitude: number },
  destinations: { driverId: string; latitude: number; longitude: number }[]
): Promise<{ driverId: string; distanceInKm: number } | null> {
  const distances = await this.calculateRoadDistances(origin, destinations);
  if (!distances.length) return null;

  return distances.reduce((min, current) =>
    current.distanceInKm < min.distanceInKm ? current : min
  );
}

}

