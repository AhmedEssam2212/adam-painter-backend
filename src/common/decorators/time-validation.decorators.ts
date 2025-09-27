import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Validator for checking if start time is before end time
@ValidatorConstraint({ name: 'isStartTimeBeforeEndTime', async: false })
export class IsStartTimeBeforeEndTimeConstraint implements ValidatorConstraintInterface {
  validate(startTime: any, args: ValidationArguments) {
    const [endTimeProperty] = args.constraints;
    const endTime = (args.object as any)[endTimeProperty];
    
    if (!startTime || !endTime) {
      return false;
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return start < end;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Start time must be before end time';
  }
}

export function IsStartTimeBeforeEndTime(endTimeProperty: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [endTimeProperty],
      validator: IsStartTimeBeforeEndTimeConstraint,
    });
  };
}

// Validator for checking if time is not in the past
@ValidatorConstraint({ name: 'isNotInPast', async: false })
export class IsNotInPastConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) {
      return false;
    }
    
    const date = new Date(value);
    const now = new Date();
    
    return date > now;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Time cannot be in the past';
  }
}

export function IsNotInPast(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotInPastConstraint,
    });
  };
}

// Validator for checking minimum duration
@ValidatorConstraint({ name: 'hasMinimumDuration', async: false })
export class HasMinimumDurationConstraint implements ValidatorConstraintInterface {
  validate(startTime: any, args: ValidationArguments) {
    const [endTimeProperty, minimumMinutes] = args.constraints;
    const endTime = (args.object as any)[endTimeProperty];
    
    if (!startTime || !endTime) {
      return false;
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();
    const minimumDuration = (minimumMinutes || 30) * 60 * 1000; // Default 30 minutes
    
    return duration >= minimumDuration;
  }

  defaultMessage(args: ValidationArguments) {
    const [, minimumMinutes] = args.constraints;
    return `Time slot must be at least ${minimumMinutes || 30} minutes long`;
  }
}

export function HasMinimumDuration(endTimeProperty: string, minimumMinutes: number = 30, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [endTimeProperty, minimumMinutes],
      validator: HasMinimumDurationConstraint,
    });
  };
}

// Validator for checking maximum duration
@ValidatorConstraint({ name: 'hasMaximumDuration', async: false })
export class HasMaximumDurationConstraint implements ValidatorConstraintInterface {
  validate(startTime: any, args: ValidationArguments) {
    const [endTimeProperty, maximumHours] = args.constraints;
    const endTime = (args.object as any)[endTimeProperty];
    
    if (!startTime || !endTime) {
      return false;
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();
    const maximumDuration = (maximumHours || 8) * 60 * 60 * 1000; // Default 8 hours
    
    return duration <= maximumDuration;
  }

  defaultMessage(args: ValidationArguments) {
    const [, maximumHours] = args.constraints;
    return `Time slot cannot exceed ${maximumHours || 8} hours`;
  }
}

export function HasMaximumDuration(endTimeProperty: string, maximumHours: number = 8, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [endTimeProperty, maximumHours],
      validator: HasMaximumDurationConstraint,
    });
  };
}

// Validator for checking advance notice
@ValidatorConstraint({ name: 'hasAdvanceNotice', async: false })
export class HasAdvanceNoticeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [minimumHours] = args.constraints;
    
    if (!value) {
      return false;
    }
    
    const startTime = new Date(value);
    const now = new Date();
    const timeDiff = startTime.getTime() - now.getTime();
    const minimumNotice = (minimumHours || 24) * 60 * 60 * 1000; // Default 24 hours
    
    return timeDiff >= minimumNotice;
  }

  defaultMessage(args: ValidationArguments) {
    const [minimumHours] = args.constraints;
    return `Bookings must be made at least ${minimumHours || 24} hours in advance`;
  }
}

export function HasAdvanceNotice(minimumHours: number = 24, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minimumHours],
      validator: HasAdvanceNoticeConstraint,
    });
  };
}
