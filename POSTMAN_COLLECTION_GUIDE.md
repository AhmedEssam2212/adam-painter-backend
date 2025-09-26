# Adam Painter Booking API - Postman Collection Guide

## 📋 Overview

This Postman collection provides complete API testing capabilities for the Adam Painter Booking System. It includes all endpoints with proper authentication, request examples, and automated token management.

## 🚀 Quick Setup

### 1. Import the Collection
1. Open Postman
2. Click **Import** button
3. Select `Adam_Painter_Booking_API.postman_collection.json`
4. The collection will be imported with all endpoints and variables

### 2. Configure Environment Variables
The collection uses these variables (automatically configured):
- `base_url`: `http://localhost:3000/api` (default)
- `jwt_token`: Auto-populated after login/register

### 3. Update Base URL (if needed)
If your server runs on a different port:
1. Go to collection variables
2. Update `base_url` to your server URL

## 🔐 Authentication Flow

### Automatic Token Management
The collection automatically handles JWT tokens:
- **Register/Login requests** save the token to `jwt_token` variable
- **All other requests** use the Bearer token automatically
- No manual token copying required!

### Test Flow
1. **Register** a new user (Painter or Customer)
2. **Login** with credentials
3. Use any authenticated endpoint

## 📁 Collection Structure

### 1. Authentication
- **Register Painter**: Create painter account
- **Register Customer**: Create customer account  
- **Login**: Authenticate existing user

### 2. User Management
- **Get Current User Profile**: View your own profile (`GET /auth/me`)
- **Update Current User Profile**: Modify your own profile (`PATCH /auth/me`)
- **Browse Painters**: View all painters (for finding painters)
- **Browse Customers**: View all customers (for painters to see customer base)

### 3. Availability Management (Painter Only)
- **Create Availability**: Define available time slots
- **Get My Availability**: View your availability
- **Update Availability**: Modify existing slots
- **Delete Availability**: Remove availability slots

### 4. Booking Management
- **Create Booking Request** (Customer): Request painting service
- **Get My Bookings** (Customer): View your bookings
- **Get My Bookings** (Painter): View assigned bookings
- **Update Booking Status** (Painter): Confirm/update bookings
- **Cancel Booking** (Customer): Cancel your booking
- **Get Booking Details**: View specific booking

### 5. Admin Management (Admin Only)
- **Get System Statistics**: View comprehensive system metrics
- **Create User**: Create users with any role
- **Get All Users**: View all users in the system
- **Update/Delete Users**: Manage any user account
- **Manage All Bookings**: View, update, delete any booking
- **System Oversight**: Complete administrative control

## 🧪 Testing Scenarios

### Scenario 1: Complete Painter Workflow
1. Register as Painter
2. Create availability slots
3. View your availability
4. Check for new bookings
5. Confirm/update booking status

### Scenario 2: Complete Customer Workflow
1. Register as Customer
2. Create booking request
3. View your bookings
4. Check booking status
5. Cancel if needed

### Scenario 3: End-to-End Flow
1. Register Painter + create availability
2. Register Customer + create booking
3. Painter confirms booking
4. Both parties view updated status

## 📝 Request Examples

### Register Painter
```json
{
  "email": "painter1@example.com",
  "password": "password123",
  "name": "John Painter",
  "role": "PAINTER"
}
```

### Create Availability
```json
{
  "startTime": "2024-12-01T09:00:00.000Z",
  "endTime": "2024-12-01T17:00:00.000Z"
}
```

### Create Booking Request
```json
{
  "startTime": "2024-12-01T10:00:00.000Z",
  "endTime": "2024-12-01T14:00:00.000Z",
  "description": "Living room painting job"
}
```

## 🔧 Customization

### Adding Custom Headers
All requests inherit collection-level auth, but you can add custom headers per request.

### Environment Variables
Create different environments for:
- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging.yourapp.com/api`
- **Production**: `https://api.yourapp.com/api`

### Test Scripts
The collection includes test scripts that:
- Auto-save JWT tokens
- Validate response status codes
- Extract important data for subsequent requests

## 🐛 Troubleshooting

### Common Issues

**1. 401 Unauthorized**
- Ensure you're logged in
- Check if JWT token is set in variables
- Token might be expired (24h default)

**2. 403 Forbidden**
- Check user role (Painter vs Customer)
- Some endpoints are role-specific

**3. 400 Bad Request**
- Verify request body format
- Check required fields
- Validate date formats (ISO 8601)

**4. 404 Not Found**
- Verify base URL is correct
- Check if server is running
- Ensure endpoint paths are correct

### Server Not Running?
Make sure your NestJS server is running:
```bash
npm run start:dev
```

## 📊 Response Format

All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 Next Steps

1. **Import the collection**
2. **Start your server** (`npm run start:dev`)
3. **Test authentication** (Register → Login)
4. **Explore all endpoints**
5. **Create your own test scenarios**

Happy testing! 🎨✨
