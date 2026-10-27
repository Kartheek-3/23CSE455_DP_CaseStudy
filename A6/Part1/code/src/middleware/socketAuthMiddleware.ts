import { Socket } from "socket.io";
import { NextFunction } from "express"; // or use custom typing if you prefer
import { AuthService } from "../application/services/AuthService";
 
export const socketAuthMiddleware = async (
    socket: Socket,
    next: (err?: Error) => void
  ): Promise<void> => {
    const token = socket.handshake.auth.token;
  
    if (!token) return next(new Error("No token"));
  
    try {
      const payload = AuthService.verifyToken(token, "access");
      if (!payload) return next(new Error("Invalid token"));
  
      socket.data.user = payload; // You can strongly type this too if needed
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  };
  