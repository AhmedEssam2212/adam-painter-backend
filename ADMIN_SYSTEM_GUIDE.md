# 🔐 Admin System Guide - Adam Painter Booking

## 📋 Overview

The Admin system provides comprehensive management capabilities for the Adam Painter Booking platform. Admins have elevated permissions to manage users, bookings, availability, and view system statistics.

## 👤 Admin Role Features

### 🔑 **Admin Access Control**
- **Role**: `ADMIN` (highest privilege level)
- **Authentication**: JWT-based with admin-specific guards
- **Access**: All endpoints + admin-only endpoints

### 🎯 **Admin Capabilities**

#### **1. User Management**
- ✅ **Create users** with any role (ADMIN/PAINTER/CUSTOMER)
- ✅ **View all users** with filtering by role
- ✅ **Update any user** profile and settings
- ✅ **Delete users** (with proper safeguards)
- ✅ **Role management** and permissions

#### **2. Booking Management**
- ✅ **View all bookings** across the system
- ✅ **Filter bookings** by status (PENDING/CONFIRMED/CANCELLED)
- ✅ **Update booking status** for any booking
- ✅ **Delete bookings** when necessary
- ✅ **Resolve conflicts** and disputes

#### **3. Availability Management**
- ✅ **View all availability** slots from all painters
- ✅ **Manage painter schedules** when needed
- ✅ **Delete availability** slots if required
- ✅ **Monitor capacity** and utilization

#### **4. System Analytics**
- ✅ **User statistics** (total users by role)
- ✅ **Booking metrics** (total, pending, confirmed, cancelled)
- ✅ **System health** monitoring
- ✅ **Performance insights**

## 🚀 Admin API Endpoints

### **Authentication**
```
POST /auth/register    # Register admin account
POST /auth/login       # Login as admin
GET  /auth/me          # Get admin profile
```

### **User Management**
```
POST   /admin/users           # Create new user
GET    /admin/users           # Get all users
GET    /admin/users/painters  # Get all painters
GET    /admin/users/customers # Get all customers
GET    /admin/users/:id       # Get user by ID
PATCH  /admin/users/:id       # Update user
DELETE /admin/users/:id       # Delete user
```

### **Booking Management**
```
GET    /admin/bookings              # Get all bookings
GET    /admin/bookings/pending      # Get pending bookings
GET    /admin/bookings/confirmed    # Get confirmed bookings
GET    /admin/bookings/cancelled    # Get cancelled bookings
PATCH  /admin/bookings/:id/status   # Update booking status
DELETE /admin/bookings/:id          # Delete booking
```

### **Availability Management**
```
GET    /admin/availability                # Get all availability
GET    /admin/availability/painter/:id    # Get painter's availability
DELETE /admin/availability/:id            # Delete availability slot
```

### **System Statistics**
```
GET /admin/stats    # Get comprehensive system statistics
```

## 🔐 Security Features

### **Admin Guard Protection**
- All admin endpoints protected by `AdminGuard`
- Automatic role verification (must be ADMIN)
- JWT authentication required
- Proper error handling for unauthorized access

### **Permission Levels**
1. **Public**: Registration, login
2. **Authenticated**: Profile management, role-specific actions
3. **Admin**: All system management capabilities

## 📊 System Statistics Response

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 25,
      "painters": 8,
      "customers": 16,
      "admins": 1
    },
    "bookings": {
      "total": 45,
      "pending": 12,
      "confirmed": 28,
      "cancelled": 5
    }
  }
}
```

## 🎯 Admin Workflows

### **1. User Management Workflow**
1. Login as admin
2. View user statistics
3. Create/update/delete users as needed
4. Monitor user activity

### **2. Booking Management Workflow**
1. Monitor pending bookings
2. Resolve conflicts or issues
3. Update booking statuses
4. Handle cancellations/refunds

### **3. System Monitoring Workflow**
1. Check system statistics
2. Monitor capacity utilization
3. Identify bottlenecks
4. Generate reports

## 🔧 Admin Account Setup

### **Seeded Admin Account**
```
Email: admin@adampainter.com
Password: admin123
Role: ADMIN
```

### **Creating Additional Admins**
```json
POST /admin/users
{
  "email": "newadmin@company.com",
  "password": "securepassword",
  "name": "New Administrator",
  "role": "ADMIN"
}
```

## ⚠️ Important Considerations

### **Security Best Practices**
- ✅ Change default admin password immediately
- ✅ Use strong passwords for admin accounts
- ✅ Limit number of admin users
- ✅ Monitor admin activity logs
- ✅ Regular security audits

### **Data Protection**
- ✅ Admin actions are logged
- ✅ Sensitive data is protected
- ✅ Proper error handling
- ✅ No password exposure in responses

### **Operational Guidelines**
- ✅ Test admin actions in staging first
- ✅ Backup data before bulk operations
- ✅ Communicate system changes to users
- ✅ Monitor system performance after changes

## 🚨 Emergency Procedures

### **System Issues**
1. Check system statistics
2. Identify problematic bookings/users
3. Take corrective action
4. Monitor system recovery

### **Data Recovery**
1. Use admin endpoints to recreate data
2. Verify data integrity
3. Test system functionality
4. Communicate status to stakeholders

The admin system provides complete control over the Adam Painter Booking platform while maintaining security and data integrity! 🎨🔧
