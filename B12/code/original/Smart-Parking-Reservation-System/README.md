# Smart Parking Reservation System

A full-stack application for managing parking reservations with real-time slot availability, user authentication, admin controls, and a live countdown timer with extend capability. Built with NestJS backend and Next.js frontend.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend API Documentation](#backend-api-documentation)
- [Features](#features)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)

## 🎯 Project Overview

Smart Parking Reservation System is a comprehensive solution for managing parking spaces and reservations. It provides:

- **User Management**: Registration, login, profile update, and password reset functionality
- **Parking Areas**: Create and manage different parking locations
- **Parking Slots**: Dynamic slot creation with section, type (standard/EV), floor, and per-slot pricing
- **Reservations**: Book, view, cancel, extend, and delete parking slots
- **Live Timer**: Real-time countdown with circular progress and extend-parking modal
- **QR Tickets**: Generate scannable QR codes for each reservation
- **Admin Dashboard**: Manage locations, slots, and all reservations
- **Email Notifications**: Automated confirmations and cancellations via Nodemailer
- **Price Engine**: Server-side `totalPrice` calculation stored on each reservation

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 11 (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM (synchronize mode)
- **Authentication**: JWT with Passport.js (bcrypt password hashing)
- **Email Service**: Nodemailer with Handlebars templates
- **Validation**: class-validator + class-transformer

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand + js-cookie
- **HTTP Client**: Axios
- **Icons**: lucide-react
- **QR Code**: qrcode.react

## 📁 Project Structure

```
smart-parking-backend/        # NestJS Backend
├── src/
│   ├── auth/                 # Authentication (JWT, roles, register, login, password reset)
│   ├── parking/              # Parking areas CRUD
│   ├── slots/                # Parking slots CRUD + availability queries
│   ├── reservations/         # Reservation CRUD + extend + expire
│   ├── seed/                 # Auto-seeds admin account on startup
│   ├── users/                # User entity
│   ├── mail/                 # Email notifications (Handlebars templates)
│   └── main.ts              # Application entry point
└── test/                     # E2E and unit tests

smart-parking-frontend/       # Next.js Frontend
├── src/
│   ├── app/                  # Page components (login, register, dashboard, parking, reservations, timer)
│   ├── components/           # Navbar, BottomNav
│   ├── services/             # Axios API client
│   ├── store/                # Zustand auth store
│   └── proxy.js             # Auth middleware (role-based redirects)
└── public/                   # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 📡 Backend API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

---

## **Auth Module** (`/auth`)

#### 1. **Register User**
```http
POST /auth/register
```
**Description**: Register a new user account
- **Authentication**: No
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```
- **Response**: User object with JWT token

#### 2. **Login**
```http
POST /auth/login
```
**Description**: Authenticate user and receive JWT token
- **Authentication**: No
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: User object with JWT token

#### 3. **Register Admin**
```http
POST /auth/register-admin
```
**Description**: Register a new admin account (restricted endpoint)
- **Authentication**: No
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "fullName": "Admin User"
}
```
- **Response**: Admin user object with JWT token

#### 4. **Get Current User Profile**
```http
GET /auth/me
```
**Description**: Get authenticated user's profile information
- **Authentication**: ✅ Required (JWT)
- **Response**: User object

#### 5. **Update Profile**
```http
PATCH /auth/profile
```
**Description**: Update the authenticated user's profile
- **Authentication**: ✅ Required (JWT)
- **Body**:
```json
{
  "fullName": "New Name",
  "phoneNumber": "01712345678"
}
```
- **Response**: Updated user object

#### 6. **Change Password**
```http
POST /auth/change-password
```
**Description**: Change password while authenticated
- **Authentication**: ✅ Required (JWT)
- **Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```
- **Response**: Success message

#### 7. **Forgot Password**
```http
POST /auth/forgot-password
```
**Description**: Send password reset code to user's email
- **Authentication**: No
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**: Success message with reset code sent

#### 8. **Reset Password**
```http
POST /auth/reset-password
```
**Description**: Reset password using code sent to email
- **Authentication**: No
- **Body**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```
- **Response**: Success message

---

## **Parking Module** (`/parking`)

#### 1. **Create Parking Area**
```http
POST /parking
```
**Description**: Create a new parking location (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Body**:
```json
{
  "name": "Downtown Parking",
  "location": "123 Main Street"
}
```
- **Response**: Created parking area object

#### 2. **Get All Parking Areas**
```http
GET /parking
```
**Description**: Retrieve all parking locations with optional search and pagination
- **Authentication**: ✅ Required (JWT)
- **Query Parameters**:
  - `search` (optional): Search parking areas by name
  - `page` (optional): Page number (default 1)
  - `limit` (optional): Items per page (default 20)
- **Response**: `{ data: ParkingArea[], total, page, limit }`

#### 3. **Update Parking Area**
```http
PATCH /parking/:id
```
**Description**: Update parking area details (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `id` - Parking area ID
- **Body**:
```json
{
  "name": "Downtown Parking Updated",
  "location": "124 Main Street"
}
```
- **Response**: Updated parking area object

#### 4. **Delete Parking Area**
```http
DELETE /parking/:id
```
**Description**: Soft-delete a parking location and all associated slots/reservations (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `id` - Parking area ID
- **Response**: Success message

---

## **Slots Module** (`/slots`)

#### 1. **Create Parking Slot**
```http
POST /slots
```
**Description**: Add a new parking slot to a location (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Body**:
```json
{
  "slotNumber": "A-01",
  "section": "A",
  "type": "standard",
  "parkingAreaId": 1,
  "floor": 1,
  "pricePerHour": 5.00
}
```
- **Response**: Created slot object

#### 2. **Get All Slots**
```http
GET /slots
```
**Description**: Retrieve all parking slots, optionally filtered by area or status
- **Authentication**: ✅ Required (JWT)
- **Query Parameters**:
  - `parkingAreaId` (optional): Filter by area
  - `status` (optional): Filter by status (`available`, `occupied`)
- **Response**: Array of slot objects with parking area relation

#### 3. **Get Available Slots**
```http
GET /slots/available/:parkingAreaId?startTime=...&endTime=...
```
**Description**: Get slots that are free during a given time window
- **Authentication**: ✅ Required (JWT)
- **Parameters**: `parkingAreaId` - Area ID
- **Query Parameters**: `startTime`, `endTime` (ISO strings)
- **Response**: Array of available slot objects

#### 4. **Update Slot**
```http
PATCH /slots/:id
```
**Description**: Update slot details or status (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `id` - Slot ID
- **Body**:
```json
{
  "section": "B",
  "type": "ev",
  "status": "available",
  "floor": 2,
  "pricePerHour": 6.00
}
```
- **Response**: Updated slot object

#### 5. **Delete Slot**
```http
DELETE /slots/:id
```
**Description**: Soft-delete a parking slot (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `id` - Slot ID
- **Response**: Success message

---

## **Reservations Module** (`/reservations`)

#### 1. **Create Reservation**
```http
POST /reservations
```
**Description**: Reserve a parking slot. Total price is computed server-side from the slot's `pricePerHour` and duration.
- **Authentication**: ✅ Required (JWT)
- **Body**:
```json
{
  "slotId": 1,
  "startTime": "2026-07-18T10:00:00.000Z",
  "endTime": "2026-07-18T12:00:00.000Z",
  "vehicleNumber": "ABC-1234",
  "phoneNumber": "01712345678",
  "vehicleType": "four_wheeler"
}
```
- **Response**: Created reservation object with `totalPrice`

#### 2. **Get My Reservations**
```http
GET /reservations/my
```
**Description**: Retrieve all reservations for the logged-in user
- **Authentication**: ✅ Required (JWT)
- **Response**: Array of user's reservation objects with slot and parking area

#### 3. **Cancel Reservation**
```http
DELETE /reservations/:id
```
**Description**: Cancel an active reservation (must be before start time)
- **Authentication**: ✅ Required (JWT)
- **Parameters**: `id` - Reservation ID
- **Response**: Success message with cancellation details

#### 4. **Delete Reservation**
```http
DELETE /reservations/:id/remove
```
**Description**: Permanently delete a reservation record (for completed/cancelled entries)
- **Authentication**: ✅ Required (JWT)
- **Parameters**: `id` - Reservation ID
- **Response**: Success message

#### 5. **Extend Reservation**
```http
PATCH /reservations/:id/extend
```
**Description**: Extend an active reservation's end time. Total price is recalculated server-side.
- **Authentication**: ✅ Required (JWT)
- **Parameters**: `id` - Reservation ID
- **Body**:
```json
{
  "additionalMinutes": 30
}
```
- **Response**: Updated reservation object with new `endTime` and `totalPrice`

#### 6. **Cancel Reservation by Slot ID** (Admin only)
```http
DELETE /reservations/slot/:slotId
```
**Description**: Cancel a reservation by slot ID (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `slotId` - Slot ID
- **Response**: Success message

#### 7. **Get All Reservations** (Admin only)
```http
GET /reservations
```
**Description**: View all reservations, optionally filtered by status
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Query Parameters**:
  - `status` (optional): `active`, `completed`, `cancelled`, `expired`
- **Response**: Array of all reservation objects with user and slot details

#### 8. **Expire Overdue Reservations** (Admin only)
```http
POST /reservations/expire
```
**Description**: Manually trigger expiry of overdue reservations
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Response**: Object with counts of completed and expired reservations

---

## **Root Endpoint**

#### 1. **Health Check**
```http
GET /
```
**Description**: API health check endpoint
- **Authentication**: No
- **Response**: "Hello World!" message

---

## 🎨 Features

### User Features
- ✅ User registration and login
- ✅ Profile update and password change
- ✅ Password reset via email code
- ✅ View parking areas with dynamic price ranges
- ✅ Browse slots with floor/section grouping
- ✅ Reserve parking slots with time picker
- ✅ View personal reservations (Ongoing / Completed / Cancelled tabs)
- ✅ Real-time countdown timer with circular progress
- ✅ Extend parking time (15 / 30 / 60 min) with cost preview
- ✅ View digital ticket with QR code
- ✅ Cancel future reservations
- ✅ Delete completed/cancelled reservation history
- ✅ Email notifications for confirmations and cancellations

### Admin Features
- ✅ Create and manage parking areas
- ✅ Create and manage parking slots (section, type, floor, pricing)
- ✅ Filter slots by parking area
- ✅ View all reservations with user details
- ✅ Cancel reservations manually
- ✅ Expire overdue reservations
- ✅ Search parking areas with pagination

### Security
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC) with guards
- ✅ Password hashing with bcrypt
- ✅ Server-side price calculation (`totalPrice` stored per reservation)
- ✅ Protected backend routes with JWT + RolesGuard
- ✅ Frontend route protection via middleware (cookie-based)
- ✅ Email verification for password reset

---

## 📥 Installation

### Backend Setup

1. **Navigate to backend directory**
```bash
cd smart-parking-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=smart_parking
JWT_SECRET=your_jwt_secret
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

4. **Create PostgreSQL database**
```bash
createdb smart_parking
```

> **Note**: The app uses TypeORM `synchronize: true`, so tables are auto-created on first startup. An admin user (`admin@admin.com` / `admin`) is auto-seeded.

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd smart-parking-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env.local` file**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## ▶️ Running the Application

### Backend

**Development Mode**
```bash
cd smart-parking-backend
npm run start:dev
```

**Production Mode**
```bash
npm run build
npm run start:prod
```

**Run Tests**
```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
```

### Frontend

**Development Mode**
```bash
cd smart-parking-frontend
npm run dev
```

The frontend will be available at `http://localhost:300`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the UNLICENSED license.

---

## 📧 Support

For support or questions, please open an issue on GitHub.

---

**Last Updated**: July 2026
