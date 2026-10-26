import jwt, { JwtPayload } from "jsonwebtoken";

export class AuthService {
  static generateAccessToken(payload: object): string {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
  }

  static generateRefreshToken(payload: object): string {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "5d" });
  }
  static verifyToken(token: string, type: "access" | "refresh"): JwtPayload | null {
    try {
      const secret =
        type === "access"
          ? (process.env.ACCESS_TOKEN_SECRET as string)
          : (process.env.REFRESH_TOKEN_SECRET as string);

      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}
