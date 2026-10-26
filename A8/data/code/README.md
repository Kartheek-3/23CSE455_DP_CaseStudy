# Airport App – GraphQL API

The Airport App is a full-featured flight and booking management system built with NestJS, GraphQL, TypeORM, postreSQL, and Redis/BullMQ. It serves both administrative staff (admins, crew, security) and users (passengers or employees) for managing flights, bookings, and related operations.

![alt text](<Untitled (2)-1.png>)

## **Core Modules & Features**

### User Management

#### Roles: USER, ADMIN, CREW, SECURITY

1- Users can sign up, log in, and update their profile.

2- Admins can approve members, assign flights to crew or security personnel, and manage employee data.

3- Includes password reset functionality for secure account recovery.

### Flight Management

1- Admins can create, update, and remove flights.

2- Flights have information such as:

- Flight number

- Departure & destination airports

- Departure/arrival times

- Airline and seat availability

- Crew members or security personnel can be assigned to specific flights.

- Supports filtering and pagination for browsing flights efficiently.

### Booking System

Users can book seats on flights.

#### Bookings track:

- User and flight details

- Assigned seats

- Booking timestamp

- Users can cancel bookings if needed.

- Admins can view all seat assignments for each booking.

### Seat Management

- Each flight has a list of seats with row and seat numbers.

- Seats have an availability status to prevent double-booking.

- Supports bulk seat booking for multiple passengers in one request.

2. Authentication & Security

- Session-based authentication ensures secure access to protected operations.

- Passwords are stored securely, and reset tokens allow temporary secure password changes.

- Google Auth using OAuth 2.0 and passportjs

### Role-based access control restricts sensitive operations:

- Admins manage flights and approvals

- Crew/security access assigned flights

- Users can manage their own bookings and profile

### Performance & Optimization

#### DataLoader is used to batch and cache database queries:

- Reduces redundant queries for nested fields (e.g., fetching users for multiple bookings)

- Improves GraphQL query performance

#### Background Processing

BullMQ handles asynchronous jobs to offload heavy tasks from the main request cycle.

Examples:

- Sending booking confirmation emails using sendgrid and mailtrap

- Updating seat availability in the background

### API & Data Access

The app uses GraphQL for flexible querying and mutations.

- Supports nested queries, filtering, pagination, and relationship resolution between users, flights, and bookings.

- The system is designed to be scalable, efficient, and easy to extend for new features.

### Typical Workflow

- User signs up or logs in.

- Admins create flights and assign crew/security personnel.

- Users book seats on flights.

- DataLoader batches nested queries for efficient retrieval of users, flights, and bookings.

- BullMQ processes background jobs, such as sending emails and updating availability.

U- sers and staff interact with the system via GraphQL queries/mutations.

---

### **Scalars**

- **DateTime**: A UTC date-time string, e.g., `"2019-12-03T09:54:33Z"`.

### **Enums**

#### **Role**

Available user roles:

- `USER`
- `ADMIN`
- `CREW`
- `SECURITY`

---

### **Types**

#### **User**

Represents a user in the system.

```graphql
type User {
  id: ID!
  role: Role!
  firstName: String
  lastName: String
  email: String!
  password: String
  passwordResetToken: String
  passwordResetTokenExpirationDate: DateTime
  passportId: String
  nationality: String
  employeeID: String
  approved: Boolean!
  ResponsibleFlights: [Flight!]
  bookedFlights: [Booking!]
}
```

#### **Flight**

Represents a flight.

```graphql
type Flight {
  id: ID!
  flightNumber: Int!
  departureAirport: String!
  destinationAirport: String!
  date: String!
  departureTime: String!
  arrivalTime: String!
  airLine: String!
  availableSeats: Int!
  responsibleBy: User
  bookings: [Booking!]
}
```

#### **Booking**

Represents a booking.

```graphql
type Booking {
  id: ID!
  user: User!
  flight: Flight!
  userId: String!
  flightId: String!
  seatId: [String!]!
  createdAt: DateTime!
  seat: [Seat!]!
}
```

#### **Seat**

Represents a seat on a flight.

```graphql
type Seat {
  seatNo: Float!
  isAvailable: Boolean!
  rowNo: Float!
  flightId: String!
}
```

## Response Types

```graphql
type forgetPasswordResponse {
  message: String!
}
type FlightResponse {
  message: String!
}
type FlightPaginationResponse {
  flights: [Flight!]
  total: Float!
  lastPage: Float!
  currentPage: Float!
  perPage: Float!
}
type responseMessage {
  message: String!
}
```

### Inputs

#### User Inputs

```graphql
input CreateUserInput {
  role: Role!
  firstName: String!
  lastName: String
  email: String!
  password: String!
  passportId: String!
  nationality: String!
  employeeID: String
}

input LoginUserInput {
  email: String!
  password: String!
}

input UpdateUserInput {
  email: String
  firstName: String
  lastName: String
}
```

#### Flight Inputs

```graphql
input CreateFlightInput {
  flightNumber: Int!
  departureAirport: String!
  destinationAirport: String!
  date: String!
  departureTime: String!
  arrivalTime: String!
  airLine: String!
  availableSeats: Int!
}

input UpdateFlightInput {
  flightNumber: Int
  departureAirport: String
  destinationAirport: String
  date: String
  departureTime: String
  arrivalTime: String
  airLine: String
  availableSeats: Int
}

input FlightAssign {
  flightId: String!
  userId: String!
}

input FlightFilterDto {
  page: Int = 1
  limit: Int = 10
  departureTime: String
  destinationAirport: String!
  departureAirport: String!
  airLine: String
  date: String!
}
```

#### Booking Inputs

```graphql
input CreateBooking {
  seats: [CreateSeatInput!]!
}

input CreateSeatInput {
  rowNo: Float!
  seatNo: Float!
  flightId: String!
}

input CancelBooking {
  bookingId: String!
}
```

#### Auth/Password Inputs

```graphql
input resetPasswordDto {
  email: String!
  password: String!
}
```

### Queries

#### flights

Retrieve a paginated list of flights.

```graphql
query Flights($flightFilter: FlightFilterDto!) {
  flights(flightFilter: $flightFilter) {
    flights {
      id
      flightNumber
      departureAirport
      destinationAirport
      date
      departureTime
      arrivalTime
      airLine
      availableSeats
    }
    total
    lastPage
    currentPage
    perPage
  }
}
```

#### myAssignedFlights

Get all flights assigned to the logged-in user.

```graphql
query MyAssignedFlights {
  myAssignedFlights {
    id
    flightNumber
    departureAirport
    destinationAirport
    date
    departureTime
    arrivalTime
    airLine
    availableSeats
  }
}
```

#### AllSeatsBookings

Get all seats for a specific booking.

```graphql
query AllSeatsBookings($bookingId: String!) {
  AllSeatsBookings(bookingId: $bookingId) {
    seatNo
    rowNo
    isAvailable
    flightId
  }
}
```

#### forgetPassword

Send a reset password email.

```graphql
query ForgetPassword($resetPasswordDto: resetPasswordDto!) {
  forgetPassword(resetPasswordDto: $resetPasswordDto) {
    message
  }
}
```

### Mutations

#### User Mutations

signupUser

```graphql
mutation SignupUser($createUserInput: CreateUserInput!) {
  signupUser(createUserInput: $createUserInput) {
    id
    role
    firstName
    lastName
    email
    passportId
    nationality
    employeeID
  }
}
```

loginUser

```graphql
mutation LoginUser($LoginUserInput: LoginUserInput!) {
  loginUser(LoginUserInput: $LoginUserInput) {
    id
    role
    firstName
    lastName
    email
  }
}
```

updateUserInfo

```graphql
mutation UpdateUserInfo($UpdateUserInput: UpdateUserInput!, $id: String!) {
  updateUserInfo(UpdateUserInput: $UpdateUserInput, id: $id) {
    id
    firstName
    lastName
    email
  }
}
```

logoutUser

```graphql
mutation LogoutUser($id: String!) {
  logoutUser(id: $id)
}
```

resetPassword

```graphql
mutation ResetPassword($forgetPassword: forgetPasswordDto!, $token: String!) {
  resetPassword(forgetPassword: $forgetPassword, token: $token) {
    message
  }
}
```

approveMembers

```graphql
mutation ApproveMembers($id: String!) {
  approveMembers(id: $id) {
    id
    approved
  }
}
```

### Flight Mutations

createFlight

```graphql
mutation CreateFlight($CreateFlightInput: CreateFlightInput!) {
  createFlight(CreateFlightInput: $CreateFlightInput) {
    id
    flightNumber
    departureAirport
    destinationAirport
    date
    departureTime
    arrivalTime
    airLine
    availableSeats
  }
}
```

updateFlight

```graphql
mutation UpdateFlight($id: String!, $UpdateFlightInput: UpdateFlightInput!) {
  updateFlight(id: $id, UpdateFlightInput: $UpdateFlightInput) {
    id
    flightNumber
    departureAirport
    destinationAirport
    date
    departureTime
    arrivalTime
    airLine
    availableSeats
  }
}
```

removeFlight

```graphql
mutation RemoveFlight($id: String!) {
  removeFlight(id: $id) {
    message
  }
}
```

assignFlight

```graphql
mutation AssignFlight($assignflight: FlightAssign!) {
  assignFlight(assignflight: $assignflight) {
    id
    responsibleBy {
      id
      role
      firstName
      lastName
    }
  }
}
```

unAssignFlight

```graphql
mutation UnAssignFlight($assignflight: FlightAssign!) {
  unAssignFlight(assignflight: $assignflight) {
    id
    responsibleBy {
      id
      role
      firstName
      lastName
    }
  }
}
```

### Booking Mutations

createBooking

```graphql
mutation CreateBooking($createBooking: CreateBooking!) {
  createBooking(createBooking: $createBooking) {
    id
    userId
    flightId
    seatId
    createdAt
    user {
      id
      firstName
      lastName
    }
    flight {
      id
      flightNumber
    }
    seat {
      seatNo
      rowNo
      isAvailable
      flightId
    }
  }
}
```

cancelBooking

```graphql
mutation CancelBooking($cancelBooking: CancelBooking!) {
  cancelBooking(cancelBooking: $cancelBooking) {
    message
  }
}
```
