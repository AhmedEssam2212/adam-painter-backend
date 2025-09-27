# 🔗 API Response Examples

This document provides detailed examples of API responses with the new user data structure.

## 📅 Availability Endpoints

### GET /api/availability
**Description:** Get all availability slots with creator information

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "createdBy": "550e8400-e29b-41d4-a716-446655440001",
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Painter",
        "role": "PAINTER"
      },
      "startTime": "2025-05-18T10:00:00.000Z",
      "endTime": "2025-05-18T14:00:00.000Z",
      "createdAt": "2025-05-18T09:00:00.000Z",
      "updatedAt": "2025-05-18T09:00:00.000Z"
    }
  ]
}
```

### POST /api/availability
**Description:** Create new availability slot (Painter only)

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "createdBy": "550e8400-e29b-41d4-a716-446655440001",
    "creator": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Painter",
      "role": "PAINTER"
    },
    "startTime": "2025-05-18T10:00:00.000Z",
    "endTime": "2025-05-18T14:00:00.000Z",
    "createdAt": "2025-05-18T09:00:00.000Z",
    "updatedAt": "2025-05-18T09:00:00.000Z"
  }
}
```

### GET /api/availability/me
**Description:** Get current painter's availability slots

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "createdBy": "550e8400-e29b-41d4-a716-446655440001",
      "creator": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Painter",
        "role": "PAINTER"
      },
      "startTime": "2025-05-18T10:00:00.000Z",
      "endTime": "2025-05-18T14:00:00.000Z",
      "createdAt": "2025-05-18T09:00:00.000Z",
      "updatedAt": "2025-05-18T09:00:00.000Z"
    }
  ]
}
```

## 📋 Booking Endpoints

### POST /api/booking-request
**Description:** Create new booking request with automatic painter assignment

**Response (Immediate Assignment):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "bookingId": "550e8400-e29b-41d4-a716-446655440002",
    "createdBy": "550e8400-e29b-41d4-a716-446655440003",
    "customer": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Jane Customer",
      "role": "CUSTOMER"
    },
    "painter": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "John Painter"
    },
    "startTime": "2025-05-18T11:00:00.000Z",
    "endTime": "2025-05-18T13:00:00.000Z",
    "status": "CONFIRMED",
    "createdAt": "2025-05-18T10:30:00.000Z",
    "updatedAt": "2025-05-18T10:30:00.000Z"
  }
}
```

**Response (Pending Assignment):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "bookingId": "550e8400-e29b-41d4-a716-446655440002",
    "createdBy": "550e8400-e29b-41d4-a716-446655440003",
    "customer": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Jane Customer",
      "role": "CUSTOMER"
    },
    "painter": null,
    "startTime": "2025-05-18T11:00:00.000Z",
    "endTime": "2025-05-18T13:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2025-05-18T10:30:00.000Z",
    "updatedAt": "2025-05-18T10:30:00.000Z"
  }
}
```

### GET /api/bookings/me
**Description:** Get current user's bookings (filtered by role)

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "bookingId": "550e8400-e29b-41d4-a716-446655440002",
      "createdBy": "550e8400-e29b-41d4-a716-446655440003",
      "customer": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "Jane Customer",
        "role": "CUSTOMER"
      },
      "painter": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "John Painter"
      },
      "startTime": "2025-05-18T11:00:00.000Z",
      "endTime": "2025-05-18T13:00:00.000Z",
      "status": "CONFIRMED",
      "createdAt": "2025-05-18T10:30:00.000Z",
      "updatedAt": "2025-05-18T10:30:00.000Z"
    }
  ]
}
```

## 🔑 Key Changes for Frontend Integration

### 1. **Availability Objects**
- **New Field:** `createdBy` - UUID of the user who created the availability
- **New Field:** `creator` - Full user object with `id`, `name`, and `role`
- **Removed Field:** `painterId` (replaced by `createdBy`)

### 2. **Booking Objects**
- **New Field:** `createdBy` - UUID of the user who created the booking
- **New Field:** `customer` - Full customer object with `id`, `name`, and `role`
- **Updated Field:** `painter` - Can be `null` for PENDING bookings
- **Removed Field:** `customerId` (replaced by `createdBy`)

### 3. **Role-Based Data Access**
- **Availabilities:** Only show slots created by PAINTER or ADMIN users
- **Bookings:** Only show bookings created by CUSTOMER or ADMIN users
- **Filtering:** APIs automatically filter based on user roles

### 4. **Booking Status Flow**
- **PENDING:** Booking created but no painter assigned yet
- **CONFIRMED:** Booking assigned to a painter (immediately or later)
- **CANCELLED:** Booking cancelled by customer or painter

## 📱 Frontend Integration Tips

1. **Display Creator Names:** Use `creator.name` for availability slots
2. **Display Customer Names:** Use `customer.name` for booking entries
3. **Handle Pending Bookings:** Check if `painter` is `null` and `status` is `PENDING`
4. **Role-Based UI:** Show different information based on user role
5. **Real-time Updates:** Consider polling for status changes on PENDING bookings
