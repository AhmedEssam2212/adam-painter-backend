import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export interface ValidationRule<T> {
  name: string;
  validate: (data: T) => Promise<boolean> | boolean;
  errorMessage: string;
}

@Injectable()
export class ValidationService {

  validateUserPermission(userRole: UserRole, requiredRoles: UserRole[], action: string): void {
    if (!requiredRoles.includes(userRole)) {
      throw new BadRequestException(`Role ${userRole} is not authorized to ${action}`);
    }
  }

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
}
