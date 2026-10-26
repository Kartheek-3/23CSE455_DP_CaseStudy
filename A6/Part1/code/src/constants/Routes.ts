export const ROUTES = {
  AUTH: {
    BASE: "/api/auth",
    REFRESH_TOKEN: "/refresh-token",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    CHANGE_PASSWORD: "/change-password",
    LOGOUT: "/logout",
    GOOGLE: {
      BASE: "/api/auth/google",
      SIGNIN: "/google-signin",
    }
  },
  USER: {
    BASE: "/api/users",
    REGISTER: "/register",
    VERIFY_OTP: "/verify-otp",
    RESEND_OTP: "/resend-otp",
    LOGIN: "/login",
    VEHICLE: {
      BASE: "/vehicle",
      BY_ID: "/vehicle/:vehicleId",
    },
    PROFILE: {
      BASE: "/profile",
      BY_ID: "/profile/:id",
    },
    NEARBY: "/nearby",
    DRIVER_DETAILS: "/driver/:driverId",
    CHANGE_PASSWORD: "/auth/change-password",
    BOOK_SLOT: "/bookslot",
    ESTIMATE_FARE: "/estimate-fare",
    UPDATE_BOOKING: "/update-booking/:rideId",
    RIDE_HISTORY: "/ridehistory",
    PAYMENT_INTENT: "/payment-intent",
    CANCEL_BOOKING: "/booking/cancel",
    CHAT: {
      BASE: "/chat/:roomId",
      MESSAGE: "/chat/:roomId/message/:messageId",
      SIGNATURE: "/chat/signature",
    },
    GET_DRIVER_BY_ID: "/driver/:id",
    WALLET: {
      BASE: "/wallet",
      BALANCE: "/wallet/balance",
      RIDE_PAYMENT: "/wallet/ridepayment",
    },
    REVIEW: {
      BASE: "/review",
      BY_ID: "/review/:id",
    },
    ACKNOWLEDGE_BOOKING: "/booking/acknowledge/:bookingId"
  },
  DRIVER: {
    BASE: "/api/drivers",
    REGISTER: "/register",
    VERIFY_OTP: "/verify-otp",
    RESEND_OTP: "/resend-otp",
    LOGIN: "/login",
    PROFILE: {
      BASE: "/driver",
      BY_ID: "/driver/:id",
    },
    RIDE_HISTORY: "/ridehistory",
    CHANGE_PASSWORD: "/auth/change-password",
    ONBOARD: "/onboard",
    BOOKINGS: "/bookings",
    BOOKING_STATUS: "/booking-status/:bookingId",
    VERIFY_ACCOUNT: "/verify-account",
    CHAT: {
      BASE: "/chat/:roomId",
      MESSAGE: "/chat/:roomId/message/:messageId",
      SIGNATURE: "/chat/signature",
    },
    USER_BY_ID: "/user/:id",
    REVIEW_BY_ID: "/review/:id",
    DASHBOARD: {
      BASE: "/dashboard",
      STATUS_SUMMARY: "/dashboard/status-summary",
      EARNINGS_SUMMARY: "/dashboard/earnings-summary",
    }
  },
  ADMIN: {
    BASE: "/api/admin",
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    USER: {
      BASE: "/user",
      UPDATE_STATUS: "/update-user-status/:userId",
    },
    DRIVER: {
      BASE: "/driver",
      STATUS: "/driver/status/:driverId",
      BLOCK_STATUS: "/driver/blockstatus/:driverId",
    },
    VEHICLES_BY_USER: "/vehicles/:userId",
    BOOKINGS: "/bookings",
  },
  FILES: {
    BASE: "/api/files",
    SIGNED_URL: "/signed-url",
  },
  BOOKING: {
    BASE: "/api",
    SLOT: "/book/slot",
    ESTIMATE_FARE: "/book/estimate-fare",
    ACCEPT: "/booking/accept/:bookingId",
  }
} as const;
