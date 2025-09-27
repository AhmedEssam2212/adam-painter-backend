# 🎨 Adam Painter Booking Assignment - Backend

A simplified scheduling system where painters can define available time slots and customers can request bookings. The system automatically assigns painters whose availability fits the requested time window.

## 🏗️ Architecture Overview

### Tech Stack
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator & class-transformer

### Key Design Decisions

**Database Design**: Single `users` table with role-based access (PAINTER/CUSTOMER)
- **Pros**: Simplified authentication, easier role management, shared user attributes
- **Cons**: Slight complexity in role-specific queries
- **Justification**: For this scale, simplicity wins. Easy to extend later if needed.

**Repository Pattern**: Generic repository interface for consistent data access patterns
**Global Error Handling**: Unified exception filter that normalizes all errors including DB errors
**Success Response Wrapper**: Interceptor that provides consistent API response format
**Time Zone Handling**: All times stored in UTC, timezone conversion at API boundaries
**Concurrency Control**: Database constraints + optimistic locking for booking conflicts

## 📋 Product Decision Assumptions

### Current Business Rules & Assumptions

**🎯 Painter Assignment Strategy**
- **Current**: First-available painter assignment (automatic)
- **Assumption**: Customers don't need to choose specific painters
- **Rationale**: Simplifies booking flow, ensures faster assignment
- **Future**: Could extend to painter preferences, ratings, or customer choice

**⏰ Time Slot Validation**
- **Current**: Minimum 30 minutes, maximum 8 hours, 24/7 availability
- **Assumption**: Reasonable work session limits for safety and quality
- **Rationale**:
  - **Worker Safety**: Prevents fatigue-related accidents and injuries
  - **Quality Assurance**: Maintains work quality throughout the session
  - **Labor Compliance**: Aligns with standard 8-hour workday regulations
  - **Realistic Expectations**: Prevents unrealistic marathon painting sessions
  - **Break Enforcement**: Encourages proper rest between long jobs
- **Future**: Configurable limits per region/painter skill level

**📅 Weekend & Holiday Support**
- **Current**: Full weekend support, no holiday restrictions
- **Assumption**: Painting services operate 7 days a week
- **Rationale**: Customer convenience and painter availability
- **Future**: Configurable weekend/holiday policies

**🔄 Booking Status Flow**
- **Current**: Simplified 3-status system with automatic assignment (PENDING → CONFIRMED → CANCELLED)
- **Flow**:
  - **PENDING**: Initial status when booking is created without available painter
  - **CONFIRMED**: Automatically assigned when painter becomes available OR immediately if painter is available
  - **CANCELLED**: When either party cancels the booking
- **Smart Assignment Logic**:
  - **Immediate Assignment**: If painter is available during booking creation → CONFIRMED
  - **Deferred Assignment**: If no painter available → PENDING, auto-assigned when painter creates availability
  - **First-Come-First-Served**: Pending bookings assigned in creation order
  - **Conflict Prevention**: System prevents double-booking automatically
- **Assumption**: Keep status management minimal for MVP while enabling flexible booking
- **Rationale**:
  - **Customer Convenience**: Can book even without immediate painter availability
  - **Painter Flexibility**: Availability creation automatically fulfills pending requests
  - **System Efficiency**: Reduces manual coordination and booking failures
  - **Clear States**: No ambiguous intermediate states
  - **Scalable**: Works with any number of painters and bookings
- **Future Enhancements**:
  - **Cancellation Rules**: 24-hour cancellation policy enforcement
  - **Advanced Statuses**: IN_PROGRESS, COMPLETED, RESCHEDULED, NO_SHOW
  - **Order Tracking**: Real-time progress updates (out of scope)
  - **Factory Pattern**: Status transition management with business rules
  - **Approval Workflow**: Multi-step painter confirmation process
  - **Priority Booking**: Premium customers get priority assignment

### 🌍 Regional Compliance & Extensibility

**⚖️ Labor Law Considerations**
The system is designed to be easily configurable for different regional requirements:

**🕐 8-Hour Maximum Rule - Why This Matters:**
- **Global Standard**: 8-hour workday is internationally recognized (ILO Convention)
- **Safety First**: Physical painting work becomes dangerous when fatigued
- **Legal Compliance**: Most jurisdictions require overtime pay after 8 hours
- **Quality Control**: Paint application quality degrades with worker fatigue
- **Insurance**: Many liability policies assume standard work hours
- **Union Standards**: Most trade unions negotiate 8-hour standard shifts
- **Health Protection**: Prevents repetitive strain and chemical exposure limits

```typescript
// Example: EU Working Time Directive compliance
const EU_WORKING_TIME_RULES = {
  maxDailyHours: 8,
  maxWeeklyHours: 48,
  mandatoryBreaks: true,
  nightWorkRestrictions: true, // 22:00 - 06:00
  sundayWorkRestrictions: true
};

// Example: Middle East weekend considerations
const MIDDLE_EAST_RULES = {
  weekendDays: ['FRIDAY', 'SATURDAY'], // Instead of Saturday/Sunday
  businessHours: { start: 8, end: 18 },
  prayerTimeBreaks: true
};

// Example: US state-specific rules
const CALIFORNIA_RULES = {
  overtimeAfter: 8, // hours per day
  doubleTimeAfter: 12,
  weekendPremium: 1.5,
  minimumRestBetweenShifts: 8 // hours
};
```

**🔧 Easy Configuration Points**
- **Business Hours**: Can be restricted per region (e.g., no work after 6 PM)
- **Weekend Rules**: Configurable weekend days and restrictions
- **Duration Limits**: Can enforce maximum work hours per labor laws
- **Break Requirements**: Mandatory breaks for long sessions
- **Holiday Calendars**: Region-specific holiday restrictions
- **Overtime Rules**: Different rates for extended hours
- **Age Restrictions**: Youth labor law compliance
- **Licensing Requirements**: Painter certification validation

### 🏗️ **Booking Status Architecture & Design Patterns**

**📊 Current Simplified Status Model**
```typescript
enum BookingStatus {
  PENDING = 'PENDING',     // Initial state - awaiting confirmation
  CONFIRMED = 'CONFIRMED', // Approved and scheduled
  CANCELLED = 'CANCELLED'  // Terminated by either party
}
```

**🎯 Design Philosophy**
- **Minimal Viable Product**: Start simple, evolve based on real usage
- **Clear State Machine**: Each status has a clear meaning and purpose
- **No Ambiguity**: Avoid intermediate states that confuse users
- **Easy Testing**: Simple states are easier to test and debug

**🚀 Future Architecture Patterns**

**Factory Method Pattern for Status Management:**
```typescript
// Future implementation example
interface BookingStatusHandler {
  canTransitionTo(newStatus: BookingStatus): boolean;
  validateTransition(booking: Booking, newStatus: BookingStatus): void;
  executeTransition(booking: Booking): Promise<Booking>;
}

class BookingStatusFactory {
  static createHandler(currentStatus: BookingStatus): BookingStatusHandler {
    switch (currentStatus) {
      case BookingStatus.PENDING:
        return new PendingStatusHandler();
      case BookingStatus.CONFIRMED:
        return new ConfirmedStatusHandler();
      // ... more handlers
    }
  }
}
```

**Advanced Status Flow (Future):**
```typescript
enum AdvancedBookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',     // Painter started work
  PAUSED = 'PAUSED',               // Temporary halt
  COMPLETED = 'COMPLETED',         // Work finished
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',     // Date/time changed
  NO_SHOW = 'NO_SHOW',            // Customer/painter didn't show
  DISPUTED = 'DISPUTED'            // Quality/payment issues
}
```

**Business Rules Engine (Future):**
```typescript
class BookingBusinessRules {
  static canCancel(booking: Booking): boolean {
    const hoursUntilStart = (booking.startTime - new Date()) / (1000 * 60 * 60);
    return hoursUntilStart >= 24; // 24-hour cancellation policy
  }

  static calculateCancellationFee(booking: Booking): number {
    // Dynamic fee calculation based on timing
  }

  static requiresApproval(booking: Booking): boolean {
    // Complex approval logic
  }
}
```

**📈 Scalability Considerations**
- **Multi-tenant**: Ready for multiple regions/companies
- **Configurable Policies**: Database-driven business rules
- **Audit Trail**: Complete booking history for compliance
- **Reporting**: Built-in analytics for labor law reporting
- **Integration Ready**: APIs for external compliance systems

### 🚀 Future Enhancement Areas

**Advanced Features We Could Add**
- **Painter Specializations**: Kitchen, bathroom, exterior specialists
- **Dynamic Pricing**: Peak hours, weekend premiums, rush jobs
- **Customer Preferences**: Preferred painters, rating system
- **Smart Scheduling**: AI-powered optimal painter assignment
- **Mobile Apps**: Real-time notifications, GPS tracking
- **Payment Integration**: Automated billing and payments
- **Quality Assurance**: Photo uploads, completion verification
- **Multi-language**: Localization for different markets
- **Weather Integration**: Outdoor painting weather considerations
- **Equipment Management**: Tool and material tracking

## 🧪 Comprehensive Test Cases

### 🔐 **Authentication & Authorization Tests**

**User Registration**
- ✅ Valid customer registration with unique email
- ✅ Valid painter registration with unique email
- ❌ Registration with duplicate email
- ❌ Registration with invalid email format
- ❌ Registration with missing required fields
- ❌ Registration with weak password
- ❌ Registration with invalid role

**User Login**
- ✅ Valid login with correct credentials
- ❌ Login with incorrect password
- ❌ Login with non-existent email
- ❌ Login with missing credentials
- ❌ Login with malformed request

**JWT Token Management**
- ✅ Access protected endpoints with valid token
- ❌ Access protected endpoints with expired token
- ❌ Access protected endpoints with invalid token
- ❌ Access protected endpoints without token
- ✅ Token refresh functionality

### 👤 **User Management Tests**

**Profile Management**
- ✅ Get current user profile
- ✅ Update user profile with valid data
- ❌ Update profile with invalid email format
- ❌ Update profile with duplicate email
- ❌ Update profile with unauthorized access
- ✅ Browse painters list (authenticated users)
- ✅ Browse customers list (authenticated users)

**Role-Based Access Control**
- ✅ Customer can access customer-specific endpoints
- ✅ Painter can access painter-specific endpoints
- ❌ Customer cannot access painter-only endpoints
- ❌ Painter cannot access customer-only endpoints
- ✅ Admin can access all endpoints

### 📅 **Availability Management Tests**

**Painter Availability Creation**
- ✅ Create valid availability slot
- ❌ Create availability with past date
- ❌ Create availability with end time before start time
- ❌ Create availability shorter than 30 minutes
- ❌ Create availability longer than 8 hours
- ❌ Create overlapping availability slots
- ❌ Customer tries to create availability (role check)

**Availability Updates**
- ✅ Painter updates own availability
- ✅ Update availability with valid time changes
- ❌ Painter updates another painter's availability
- ❌ Update availability that has confirmed bookings
- ❌ Update to create time conflicts

**Availability Deletion**
- ✅ Delete availability with no bookings
- ❌ Delete availability with confirmed bookings
- ❌ Delete another painter's availability

### 📋 **Booking Management Tests**

**Booking Creation**
- ✅ Customer creates valid booking request
- ✅ System auto-assigns available painter
- ✅ Booking status set to CONFIRMED when painter assigned
- ❌ Create booking with no available painters
- ❌ Create booking with invalid time range
- ❌ Create booking shorter than 30 minutes
- ❌ Create booking longer than 8 hours
- ❌ Create booking in the past
- ❌ Painter tries to create booking (role check)

**Booking Status Management**
- ✅ Customer cancels own booking
- ✅ Painter cancels assigned booking
- ❌ Cancel already cancelled booking
- ❌ User cancels booking they're not involved in
- ✅ Admin updates any booking status
- ❌ Invalid status transition

**Booking Queries**
- ✅ Customer views own bookings
- ✅ Painter views assigned bookings
- ✅ Get specific booking details
- ❌ View booking not involved in
- ✅ Admin views all bookings with filters

**Booking Updates**
- ✅ Update booking time within availability
- ❌ Update to create painter conflicts
- ❌ Update booking user is not involved in
- ✅ Update booking description/notes

### ⚡ **Concurrency & Race Condition Tests**

**Simultaneous Booking Attempts**
- ❌ Two customers book same painter slot simultaneously
- ✅ Database constraints prevent double-booking
- ✅ Proper error handling for conflicts
- ✅ Optimistic locking works correctly

**Availability Conflicts**
- ❌ Painter creates overlapping availability
- ❌ Booking created during availability deletion
- ✅ Proper transaction handling

### 🔍 **Data Validation Tests**

**Time Slot Validation**
- ❌ Start time after end time
- ❌ Duration less than 30 minutes
- ❌ Duration more than 8 hours
- ❌ Invalid date formats
- ❌ Null/undefined time values
- ✅ Valid time ranges pass validation

**Business Rules Validation**
- ✅ Minimum 30-minute duration enforced
- ✅ Maximum 8-hour duration enforced
- ✅ Future date requirement enforced
- ✅ Painter assignment logic works
- ✅ Status transition rules enforced

### 🚨 **Error Handling Tests**

**Database Errors**
- ❌ Database connection failure
- ❌ Constraint violation errors
- ❌ Transaction rollback scenarios
- ✅ Graceful error responses

**Validation Errors**
- ❌ Malformed JSON requests
- ❌ Missing required fields
- ❌ Invalid data types
- ✅ Proper error messages returned

**Business Logic Errors**
- ❌ Booking conflicts
- ❌ Unauthorized access attempts
- ❌ Invalid state transitions
- ✅ User-friendly error messages

### 📊 **Performance & Load Tests**

**API Performance**
- ✅ Response times under acceptable limits
- ✅ Database query optimization
- ✅ Proper indexing on frequently queried fields
- ✅ Pagination for large datasets

**Concurrent Users**
- ✅ Multiple users browsing simultaneously
- ✅ Multiple booking attempts handled gracefully
- ✅ System stability under load

### 🔒 **Security Tests**

**Input Sanitization**
- ❌ SQL injection attempts
- ❌ XSS payload injection
- ❌ Command injection attempts
- ✅ Proper input validation and sanitization

**Authorization Bypass**
- ❌ JWT token manipulation
- ❌ Role escalation attempts
- ❌ Direct object reference attacks
- ✅ Proper access control enforcement

**Data Protection**
- ✅ Passwords properly hashed
- ✅ Sensitive data not logged
- ✅ HTTPS enforcement (production)
- ✅ Proper CORS configuration

### 🌐 **Integration Tests**

**End-to-End Workflows**
- ✅ Complete booking flow: Register → Login → Create Availability → Book → Cancel
- ✅ Multi-user scenarios: Customer books painter's availability
- ✅ Admin management workflows
- ✅ Error recovery scenarios

**API Contract Tests**
- ✅ Request/response schema validation
- ✅ HTTP status codes correctness
- ✅ Content-Type headers proper
- ✅ API versioning compatibility

### 📱 **Edge Cases & Boundary Tests**

**Time Zone Handling**
- ✅ UTC storage and conversion
- ✅ Different client time zones
- ✅ Daylight saving time transitions
- ✅ Cross-midnight bookings










**Test Implementation Commands**
```bash

# Run e2e tests
npm run test:e2e

# Test coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```



**Mocking Strategy**
- **External Services**: Mock third-party APIs
- **Database**: Use test database or in-memory DB
- **Time**: Mock Date.now() for consistent testing
- **Email**: Mock email service for notifications

**Test Environment Setup**
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```



## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd adam-painter-backend
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb adam_painter_db

# Update .env file with your database credentials
cp .env.example .env
# Edit DATABASE_URL in .env file

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Note: If upgrading from a previous version, you may need to create a migration
# to remove unused booking statuses (IN_PROGRESS, COMPLETED) from the database:
# npx prisma migrate dev --name remove_unused_booking_statuses

# Seed database with demo data
npm run prisma:seed
```

### 3. Start Development Server
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

## 📊 Database Schema

### Users Table
- Handles both painters and customers with role-based access
- Passwords are hashed using bcrypt

### Availability Table
- Painters define their available time slots
- Includes conflict detection for overlapping slots

### Bookings Table
- Customer requests with automatic painter assignment
- Status tracking (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- References to availability slots used

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control.

### Demo Users (after seeding)
```
Painters:
- painter1@example.com / password123
- painter2@example.com / password123

Customers:
- customer1@example.com / password123
- customer2@example.com / password123
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "PAINTER" | "CUSTOMER"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <jwt-token>
```

### Painter Availability Endpoints

#### Create Availability Slot
```http
POST /availability
Authorization: Bearer <painter-jwt-token>
Content-Type: application/json

{
  "startTime": "2025-05-18T10:00:00Z",
  "endTime": "2025-05-18T14:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "createdBy": "uuid",
    "creator": {
      "id": "uuid",
      "name": "John Painter",
      "role": "PAINTER"
    },
    "startTime": "2025-05-18T10:00:00Z",
    "endTime": "2025-05-18T14:00:00Z",
    "createdAt": "2025-05-18T09:00:00Z",
    "updatedAt": "2025-05-18T09:00:00Z"
  }
}
```

#### Get All Availabilities
```http
GET /availability
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "uuid",
      "createdBy": "uuid",
      "creator": {
        "id": "uuid",
        "name": "John Painter",
        "role": "PAINTER"
      },
      "startTime": "2025-05-18T10:00:00Z",
      "endTime": "2025-05-18T14:00:00Z",
      "createdAt": "2025-05-18T09:00:00Z",
      "updatedAt": "2025-05-18T09:00:00Z"
    }
  ]
}
```

#### Get My Availability
```http
GET /availability/me
Authorization: Bearer <painter-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "uuid",
      "createdBy": "uuid",
      "creator": {
        "id": "uuid",
        "name": "John Painter",
        "role": "PAINTER"
      },
      "startTime": "2025-05-18T10:00:00Z",
      "endTime": "2025-05-18T14:00:00Z",
      "createdAt": "2025-05-18T09:00:00Z",
      "updatedAt": "2025-05-18T09:00:00Z"
    }
  ]
}
```

### Customer Booking Endpoints

#### Create Booking Request
```http
POST /booking-request
Authorization: Bearer <customer-jwt-token>
Content-Type: application/json

{
  "startTime": "2025-05-18T11:00:00Z",
  "endTime": "2025-05-18T13:00:00Z"
}
```

**Success Response (Immediate Assignment):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "bookingId": "uuid",
    "createdBy": "uuid",
    "customer": {
      "id": "uuid",
      "name": "John Customer",
      "role": "CUSTOMER"
    },
    "painter": {
      "id": "uuid",
      "name": "Best Painter"
    },
    "startTime": "2025-05-18T11:00:00Z",
    "endTime": "2025-05-18T13:00:00Z",
    "status": "CONFIRMED",
    "createdAt": "2025-05-18T10:00:00Z",
    "updatedAt": "2025-05-18T10:00:00Z"
  }
}
```

**Success Response (Pending Assignment):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "bookingId": "uuid",
    "createdBy": "uuid",
    "customer": {
      "id": "uuid",
      "name": "John Customer",
      "role": "CUSTOMER"
    },
    "painter": null,
    "startTime": "2025-05-18T11:00:00Z",
    "endTime": "2025-05-18T13:00:00Z",
    "status": "PENDING",
    "createdAt": "2025-05-18T10:00:00Z",
    "updatedAt": "2025-05-18T10:00:00Z"
  }
}
```

**Failure Response:**
```json
{
  "success": false,
  "message": "No painters are available for the requested time slot.",
  "timestamp": "2025-05-18T10:00:00Z",
  "path": "/api/booking-request"
}
```

#### Get My Bookings
```http
GET /bookings/me
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "bookingId": "uuid",
      "createdBy": "uuid",
      "customer": {
        "id": "uuid",
        "name": "John Customer",
        "role": "CUSTOMER"
      },
      "painter": {
        "id": "uuid",
        "name": "Best Painter"
      },
      "startTime": "2025-05-18T11:00:00Z",
      "endTime": "2025-05-18T13:00:00Z",
      "status": "CONFIRMED",
      "createdAt": "2025-05-18T10:00:00Z",
      "updatedAt": "2025-05-18T10:00:00Z"
    }
  ]
}
```

### Additional Endpoints

#### Get All Bookings (Admin)
```http
GET /bookings
Authorization: Bearer <jwt-token>
```

#### Update Booking
```http
PATCH /bookings/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "CANCELLED"
}
```

#### Cancel Booking
```http
PATCH /bookings/:id/cancel
Authorization: Bearer <jwt-token>
```


### Project Structure
```
src/
├── common/                 # Shared utilities
│   ├── dto/               # Common DTOs
│   ├── enums/             # Enums and constants
│   ├── filters/           # Global exception filters
│   ├── interceptors/      # Global interceptors
│   ├── interfaces/        # Generic interfaces
│   └── services/          # Common services (Prisma)
├── config/                # Configuration files
├── modules/               # Feature modules
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── availability/      # Painter availability
│   └── booking/           # Booking system
├── app.module.ts          # Root application module
└── main.ts               # Application entry point
```

### Key Features Implemented

✅ **Repository Pattern**: Generic repository interface with concrete implementations
✅ **Global Exception Filter**: Normalizes all errors including Prisma DB errors
✅ **Success Response Interceptor**: Unified API response format
✅ **JWT Authentication**: Role-based access control (PAINTER/CUSTOMER)
✅ **Automatic Painter Assignment**: System assigns available painters to booking requests
✅ **Conflict Detection**: Prevents double bookings and overlapping availability
✅ **Time Validation**: Prevents past bookings and invalid time ranges
✅ **Role-based Authorization**: Different permissions for painters and customers



## Author 
Ahmed Essam