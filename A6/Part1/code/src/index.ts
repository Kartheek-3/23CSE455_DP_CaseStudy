import "reflect-metadata";

// 1️⃣ LOAD ALL DI FIRST
import "./infrastructure/config/container";
import "./infrastructure/config/useCaseContainer";
import "./infrastructure/config/controllerContainer";

import http from 'http';
import express from "express";
import { connectDB } from "./config/database";
import cookieParser from "cookie-parser";
import cors from 'cors';
import dotenv from "dotenv";

// 2️⃣ AFTER DI, YOU CAN IMPORT CONTROLLERS & ROUTES
import userRoutes from "./presentation/routes/userRoutes";
import driverRoute from './presentation/routes/driverRoutes';
import AuthRoute from './presentation/routes/AuthRoute';
import adminRoutes from './presentation/routes/adminRoutes';
import fileroute from './presentation/routes/fileRoutes';
import googleRoute from './presentation/routes/googleAuthRoute';
import Bookroute from './presentation/routes/BookingRoute';

import { ROUTES } from "./constants/Routes";
import { errorHandler } from "./middleware/errorHandler";
import { initializeSocket } from "./infrastructure/socket/socket";
import { initializeReferralSocket } from "./infrastructure/socket/referralSocket";
import { NotificationSocket } from "./infrastructure/socket/SocketNotification";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// 3️⃣ ROUTES (they can safely resolve controllers now)
app.use(ROUTES.USER.BASE, userRoutes);
app.use(ROUTES.DRIVER.BASE, driverRoute);
app.use(ROUTES.ADMIN.BASE, adminRoutes);
app.use(ROUTES.FILES.BASE, fileroute);
app.use(ROUTES.BOOKING.BASE, Bookroute);
app.use(ROUTES.AUTH.BASE, AuthRoute);
app.use(ROUTES.AUTH.GOOGLE.BASE, googleRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// 4️⃣ Socket initialization
initializeSocket(server);
initializeReferralSocket();
NotificationSocket();

import { CronScheduler } from "./infrastructure/services/CronScheduler";

// 5️⃣ DB + Server start
connectDB().then(() => {
  CronScheduler.start();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});










