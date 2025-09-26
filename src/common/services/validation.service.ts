import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

export interface ValidationRule<T> {
  name: string;
  validate: (data: T) => Promise<boolean> | boolean;
  errorMessage: string;
}

@Injectable()
export class ValidationService {
  
  /**
   * Validates time slot constraints
   */
  validateTimeSlot(timeSlot: TimeSlot): void {
    const { startTime, endTime } = timeSlot;
    const now = new Date();

    // Rule 1: Start time must be before end time
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Rule 2: Cannot create slots in the past
    if (startTime < now) {
      throw new BadRequestException('Cannot create time slots in the past');
    }

    // Rule 3: Minimum duration (30 minutes)
    const duration = endTime.getTime() - startTime.getTime();
    const minimumDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    if (duration < minimumDuration) {
      throw new BadRequestException('Time slot must be at least 30 minutes long');
    }

    // Rule 4: Maximum duration (8 hours)
    // Prevents excessively long sessions that could lead to:
    // - Worker fatigue and safety issues
    // - Quality degradation over extended periods
    // - Potential labor law violations in many jurisdictions
    // - Unrealistic booking expectations
    const maximumDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    if (duration > maximumDuration) {
      throw new BadRequestException('Time slot cannot exceed 8 hours');
    }

    // Rule 5: Business hours validation - REMOVED
    // Time slots can now be scheduled at any hour of the day

    // Weekend bookings are now allowed
  }

  /**
   * Validates booking advance notice
   */
  validateAdvanceNotice(startTime: Date, minimumHours: number = 24): void {
    const now = new Date();
    const timeDiff = startTime.getTime() - now.getTime();
    const minimumNotice = minimumHours * 60 * 60 * 1000;

    if (timeDiff < minimumNotice) {
      throw new BadRequestException(`Bookings must be made at least ${minimumHours} hours in advance`);
    }
  }

  /**
   * Validates user permissions for specific actions
   */
  validateUserPermission(
    userRole: UserRole, 
    requiredRoles: UserRole[], 
    action: string
  ): void {
    if (!requiredRoles.includes(userRole)) {
      throw new BadRequestException(`Role ${userRole} is not authorized to ${action}`);
    }
  }

  /**
   * Validates email format
   */
  validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  /**
   * Validates password strength
   */
  validatePassword(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    if (!hasUpperCase) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (!hasLowerCase) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (!hasNumbers) {
      throw new BadRequestException('Password must contain at least one number');
    }

    if (!hasSpecialChar) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  /**
   * Validates phone number format
   */
  validatePhoneNumber(phone: string): void {
    // Simple phone validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new BadRequestException('Invalid phone number format');
    }
  }

  /**
   * Generic validation runner
   */
  async runValidations<T>(data: T, rules: ValidationRule<T>[]): Promise<void> {
    for (const rule of rules) {
      try {
        const isValid = await rule.validate(data);
        if (!isValid) {
          throw new BadRequestException(rule.errorMessage);
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException(`Validation failed for rule: ${rule.name}`);
      }
    }
  }

  /**
   * Validates date range
   */
  validateDateRange(startDate: Date, endDate: Date, maxDays: number = 30): void {
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > maxDays) {
      throw new BadRequestException(`Date range cannot exceed ${maxDays} days`);
    }
  }

  /**
   * Validates pagination parameters
   */
  validatePagination(page: number, limit: number, maxLimit: number = 100): void {
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }

    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    if (limit > maxLimit) {
      throw new BadRequestException(`Limit cannot exceed ${maxLimit}`);
    }
  }

  /**
   * Validates UUID format
   */
  validateUUID(uuid: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      throw new BadRequestException('Invalid UUID format');
    }
  }

  /**
   * Validates required fields
   */
  validateRequiredFields(data: Record<string, any>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
}
