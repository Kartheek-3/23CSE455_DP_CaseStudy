import axios from "axios";
import { injectable } from "tsyringe";

@injectable()
export class GoogleDistanceService {
  private readonly _API_URL = process.env.GOOGLEMAP_API_URL! 
  private readonly _API_KEY = process.env.GOOGLE_MAPS_API_KEY! 

  async getDistances(userLocation: { latitude: number; longitude: number }, drivers: { id: string; latitude: number; longitude: number }[]) {
    if (!this._API_KEY) {
      throw new Error("Google Maps API Key is missing");
    }

    const origins = `${userLocation.latitude},${userLocation.longitude}`;
    const destinations = drivers.map(d => `${d.latitude},${d.longitude}`).join("|");

    try {
      const response = await axios.get(this._API_URL, {
        params: {
          origins,
          destinations,
          key: this._API_KEY,
          units: "metric",
        },
      });


      if (response.data.status !== "OK") {
        throw new Error("Error fetching distance data from Google Maps API");
      }

      const distances: Record<string, number> = {};
      response.data.rows[0].elements.forEach((element: any, index: number) => {
        if (element.status === "OK") {
          distances[drivers[index].id] = element.distance.value / 1000; // Convert meters to km
        }
      });

      return distances;
    } catch (error) {
      console.error("Google Maps Distance API Error:", error);
      throw new Error("Failed to fetch distance data");
    }
  }
}
