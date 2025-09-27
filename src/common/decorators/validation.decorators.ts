import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Strong password validator
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (!password) {
      return false;
    }

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsStrongPasswordConstraint,
    });
  };
}

// Phone number validator
@ValidatorConstraint({ name: 'isValidPhoneNumber', async: false })
export class IsValidPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(phone: string, args: ValidationArguments) {
    if (!phone) {
      return false;
    }

    // Simple phone validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid phone number format';
  }
}

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidPhoneNumberConstraint,
    });
  };
}

// Date range validator
@ValidatorConstraint({ name: 'isValidDateRange', async: false })
export class IsValidDateRangeConstraint implements ValidatorConstraintInterface {
  validate(startDate: any, args: ValidationArguments) {
    const [endDateProperty, maxDays] = args.constraints;
    const endDate = (args.object as any)[endDateProperty];
    
    if (!startDate || !endDate) {
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return false;
    }
    
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= (maxDays || 30);
  }

  defaultMessage(args: ValidationArguments) {
    const [, maxDays] = args.constraints;
    return `Date range cannot exceed ${maxDays || 30} days and start date must be before end date`;
  }
}

export function IsValidDateRange(endDateProperty: string, maxDays: number = 30, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [endDateProperty, maxDays],
      validator: IsValidDateRangeConstraint,
    });
  };
}

// Pagination validator
@ValidatorConstraint({ name: 'isValidPagination', async: false })
export class IsValidPaginationConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [type, maxLimit] = args.constraints;
    
    if (value === undefined || value === null) {
      return false;
    }
    
    const numValue = Number(value);
    
    if (type === 'page') {
      return numValue >= 1;
    }
    
    if (type === 'limit') {
      return numValue >= 1 && numValue <= (maxLimit || 100);
    }
    
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const [type, maxLimit] = args.constraints;
    
    if (type === 'page') {
      return 'Page number must be greater than 0';
    }
    
    if (type === 'limit') {
      return `Limit must be between 1 and ${maxLimit || 100}`;
    }
    
    return 'Invalid pagination value';
  }
}

export function IsValidPage(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: ['page'],
      validator: IsValidPaginationConstraint,
    });
  };
}

export function IsValidLimit(maxLimit: number = 100, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: ['limit', maxLimit],
      validator: IsValidPaginationConstraint,
    });
  };
}
