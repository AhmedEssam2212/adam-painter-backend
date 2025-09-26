# 🏗️ API Architecture - Adam Painter Booking System

## 📋 Overview

This document explains the clean, role-based API architecture that eliminates duplication and provides clear separation of concerns.

## 🎯 **Design Principles**

### ✅ **Single Responsibility**
- Each endpoint has one clear purpose
- No duplication between controllers
- Clear role-based access control

### ✅ **Role-Based Access Control**
- **Public**: Registration, login
- **Authenticated**: Self-management, browsing
- **Role-Specific**: Painter/Customer specific actions
- **Admin**: System-wide management

## 🔐 **API Structure by Access Level**

### **1. Public Access (No Authentication)**
```
POST /auth/register    # User registration
POST /auth/login       # User authentication
```

### **2. Authenticated User Access (JWT Required)**
```
# Self-Management
GET  /auth/me          # Get own profile
PATCH /auth/me         # Update own profile

# Browsing (Discovery)
GET  /users/painters   # Browse painters (for customers)
GET  /users/customers  # Browse customers (for painters)
```

### **3. Role-Specific Access (JWT + Role)**

#### **Painter-Only Endpoints**
```
# Availability Management
POST   /availability           # Create availability slots
GET    /availability/me        # Get my availability
PATCH  /availability/:id       # Update my availability
DELETE /availability/:id       # Delete my availability

# Booking Management (Painter Side)
GET    /booking/painter/me     # Get my assigned bookings
PATCH  /booking/:id/status     # Update booking status
```

#### **Customer-Only Endpoints**
```
# Booking Requests
POST   /booking-request        # Create booking request
GET    /booking/customer/me    # Get my bookings
PATCH  /booking/:id/cancel     # Cancel my booking
```

#### **Shared Authenticated Endpoints**
```
GET    /booking/:id            # Get booking details (if involved)
```

### **4. Admin-Only Access (JWT + Admin Role)**
```
# User Management
POST   /admin/users           # Create any user
GET    /admin/users           # Get all users
GET    /admin/users/painters  # Get all painters
GET    /admin/users/customers # Get all customers
GET    /admin/users/:id       # Get any user
PATCH  /admin/users/:id       # Update any user
DELETE /admin/users/:id       # Delete any user

# Booking Management
GET    /admin/bookings              # Get all bookings
GET    /admin/bookings/pending      # Get pending bookings
GET    /admin/bookings/confirmed    # Get confirmed bookings
GET    /admin/bookings/cancelled    # Get cancelled bookings
PATCH  /admin/bookings/:id/status   # Update any booking status
DELETE /admin/bookings/:id          # Delete any booking

# Availability Management
GET    /admin/availability                # Get all availability
GET    /admin/availability/painter/:id    # Get painter's availability
DELETE /admin/availability/:id            # Delete any availability

# System Analytics
GET    /admin/stats            # Get system statistics
```

## 🚫 **What Was Removed (Duplication Eliminated)**

### **Before (Problematic)**
```
# User Controller (Admin-only) - DUPLICATED
POST   /users           # Same as /admin/users
GET    /users           # Same as /admin/users
GET    /users/:id       # Same as /admin/users/:id
PATCH  /users/:id       # Same as /admin/users/:id
DELETE /users/:id       # Same as /admin/users/:id

# Admin Controller - DUPLICATED
POST   /admin/users     # Same as /users
GET    /admin/users     # Same as /users
# ... etc
```

### **After (Clean)**
```
# User Controller (Authenticated) - BROWSING ONLY
GET    /users/painters  # Browse painters
GET    /users/customers # Browse customers

# Admin Controller (Admin-only) - MANAGEMENT ONLY
POST   /admin/users     # Create users
GET    /admin/users     # Manage all users
# ... etc (no duplication)
```

## 🎯 **Use Cases by Role**

### **👤 Customer Journey**
1. **Register**: `POST /auth/register` (role: CUSTOMER)
2. **Login**: `POST /auth/login`
3. **Browse Painters**: `GET /users/painters`
4. **Create Booking**: `POST /booking-request`
5. **View My Bookings**: `GET /booking/customer/me`
6. **Update Profile**: `PATCH /auth/me`

### **🎨 Painter Journey**
1. **Register**: `POST /auth/register` (role: PAINTER)
2. **Login**: `POST /auth/login`
3. **Create Availability**: `POST /availability`
4. **View My Bookings**: `GET /booking/painter/me`
5. **Confirm Bookings**: `PATCH /booking/:id/status`
6. **Browse Customers**: `GET /users/customers`

### **👑 Admin Journey**
1. **Login**: `POST /auth/login` (role: ADMIN)
2. **View System Stats**: `GET /admin/stats`
3. **Manage Users**: `GET /admin/users`, `POST /admin/users`
4. **Monitor Bookings**: `GET /admin/bookings`
5. **Resolve Issues**: `PATCH /admin/bookings/:id/status`

## 🔒 **Security Model**

### **Guard Hierarchy**
```
1. No Guard           → Public access
2. JwtAuthGuard       → Authenticated users
3. RolesGuard         → Role-specific access
4. AdminGuard         → Admin-only access
```

### **Permission Matrix**
| Endpoint | Public | Customer | Painter | Admin |
|----------|--------|----------|---------|-------|
| `/auth/*` | ✅ | ✅ | ✅ | ✅ |
| `/users/painters` | ❌ | ✅ | ✅ | ✅ |
| `/availability` | ❌ | ❌ | ✅ | ✅ |
| `/booking-request` | ❌ | ✅ | ❌ | ✅ |
| `/admin/*` | ❌ | ❌ | ❌ | ✅ |

## ✅ **Benefits of This Architecture**

### **1. No Duplication**
- Each endpoint has a single, clear purpose
- No redundant CRUD operations
- Cleaner codebase and maintenance

### **2. Clear Separation of Concerns**
- **User Controller**: Browsing and discovery
- **Auth Controller**: Self-management
- **Role Controllers**: Role-specific actions
- **Admin Controller**: System management

### **3. Better Security**
- Principle of least privilege
- Clear permission boundaries
- Easier to audit and secure

### **4. Improved UX**
- Logical endpoint grouping
- Intuitive API structure
- Clear documentation

### **5. Maintainability**
- Single source of truth for each operation
- Easier testing and debugging
- Cleaner code organization

This architecture provides a clean, secure, and maintainable API structure without duplication! 🎨🏗️
