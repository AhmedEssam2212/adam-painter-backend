/**
 * Prisma Types Export
 * This file re-exports Prisma types to solve import issues
 */

// Re-export all Prisma types
export type {
  User,
  Availability,
  Booking,
  UserRole,
  BookingStatus,
  Prisma,
} from '@prisma/client';

// Re-export Prisma client
export { PrismaClient } from '@prisma/client';
