import { injectable } from "tsyringe";
import { redis } from "../../config/redisconfig";
import { IRedisrepository } from "../../domain/repositories/IRedisrepository"; 
import { RegistrationPayload } from "../../domain/models/RegistrationPayload";

@injectable()
export class RedisUserRegistrationStore implements IRedisrepository{
  async addUser(email: string, userData: RegistrationPayload): Promise<void> {
    await redis.set(`register:${email}`, JSON.stringify(userData), { ex: 600 }); // Expiry: 5 mins
  }
  async addTokenUser(role: string, token: string, userId: string): Promise<void> {
    await redis.set(`${role}_${token}`, userId, { ex: 300 }); // Expiry: 5 mins
  }
  async removeTokenUser(role: string, token: string): Promise<void> {
    await redis.del(`${role}_${token}`);
  }
  async getTokenUser(role: string, token: string): Promise<string | null> {
    const userId = await redis.get(`${role}_${token}`)as string | null;
    return userId
  }
  async getUser(email: string): Promise<RegistrationPayload | null> {
    const data = await redis.get<RegistrationPayload>(`register:${email}`);
   
    return data 
  }

  async removeUser(email: string): Promise<void> {
    await redis.del(`register:${email}`);
  }

  async clearUsers(): Promise<void> {
    const keys = await redis.keys("register:*");
    for (const key of keys) {
      await redis.del(key);
    }
  }
}
