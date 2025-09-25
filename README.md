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
    "painterId": "uuid",
    "startTime": "2025-05-18T10:00:00Z",
    "endTime": "2025-05-18T14:00:00Z",
    "createdAt": "2025-05-18T09:00:00Z",
    "updatedAt": "2025-05-18T09:00:00Z"
  }
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
      "painterId": "uuid",
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

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "bookingId": "uuid",
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

## 🛠️ Development

### Available Scripts
```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debug mode

# Production
npm run build              # Build the application
npm run start:prod         # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio (DB GUI)
npm run prisma:seed        # Seed database with demo data

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
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

## 🔄 Git Workflow Recommendations

### Branching Strategy
```bash
main                    # Production-ready code
├── develop            # Integration branch
├── feature/auth       # Feature branches
├── feature/booking    # Feature branches
└── hotfix/bug-fix     # Emergency fixes
```

### Commit Message Convention
```bash
# Format: <type>(<scope>): <description>
feat(auth): add JWT authentication system
fix(booking): resolve painter assignment logic
docs(readme): update API documentation
refactor(availability): improve repository pattern
test(booking): add unit tests for booking service
```

### Recommended Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat(scope): description"

# 3. Push and create PR
git push origin feature/new-feature

# 4. Merge to develop, then to main
```

## Author 
Ahmed Essam