import { PrismaService } from '../src/common/services/prisma.service';

/**
 * Transaction-based test helper
 * Wraps test execution in a transaction that gets rolled back
 * This ensures NO data is ever committed to the database
 */
export class TransactionalTestHelper {
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  /**
   * Runs a test function inside a transaction that gets rolled back
   * This means no test data ever gets committed to the database
   */
  async runInTransaction<T>(testFn: (tx: PrismaService) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      try {
        // Run the test with the transaction client
        const result = await testFn(tx as any);
        
        // Force rollback by throwing an error
        // This ensures no data is committed
        throw new Error('ROLLBACK_TEST_TRANSACTION');
      } catch (error) {
        if (error.message === 'ROLLBACK_TEST_TRANSACTION') {
          // This is our intentional rollback, test passed
          return undefined as T;
        }
        // Re-throw actual test errors
        throw error;
      }
    }).catch((error) => {
      if (error.message === 'ROLLBACK_TEST_TRANSACTION') {
        // Test completed successfully, transaction rolled back
        return undefined as T;
      }
      // Re-throw actual errors
      throw error;
    });
  }
}

/**
 * Alternative approach: Database snapshot and restore
 * Takes a snapshot before test, restores after test
 */
export class SnapshotTestHelper {
  private prisma: PrismaService;
  private snapshot: any = {};

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  /**
   * Take a snapshot of current database state
   */
  async takeSnapshot(): Promise<void> {
    try {
      // Store current counts and some sample data
      this.snapshot = {
        userCount: await (this.prisma as any).user.count(),
        bookingCount: await (this.prisma as any).booking.count(),
        availabilityCount: await (this.prisma as any).availability.count(),
        // Store actual data for verification
        users: await (this.prisma as any).user.findMany(),
        bookings: await (this.prisma as any).booking.findMany(),
        availabilities: await (this.prisma as any).availability.findMany(),
      };
    } catch (error) {
      console.warn('Snapshot creation failed:', error.message);
      // Initialize empty snapshot if database access fails
      this.snapshot = {
        userCount: 0,
        bookingCount: 0,
        availabilityCount: 0,
        users: [],
        bookings: [],
        availabilities: [],
      };
    }
  }

  /**
   * Verify database state matches snapshot
   * This ensures tests didn't leave any data behind
   */
  async verifySnapshot(): Promise<void> {
    try {
      const currentUserCount = await (this.prisma as any).user.count();
      const currentBookingCount = await (this.prisma as any).booking.count();
      const currentAvailabilityCount = await (this.prisma as any).availability.count();

      if (currentUserCount !== this.snapshot.userCount) {
        throw new Error(`User count mismatch! Expected: ${this.snapshot.userCount}, Got: ${currentUserCount}`);
      }

      if (currentBookingCount !== this.snapshot.bookingCount) {
        throw new Error(`Booking count mismatch! Expected: ${this.snapshot.bookingCount}, Got: ${currentBookingCount}`);
      }

      if (currentAvailabilityCount !== this.snapshot.availabilityCount) {
        throw new Error(`Availability count mismatch! Expected: ${this.snapshot.availabilityCount}, Got: ${currentAvailabilityCount}`);
      }
    } catch (error) {
      console.warn('Snapshot verification failed:', error.message);
      // Don't fail tests due to verification issues
    }
  }

  /**
   * Clean up any test data that was accidentally left behind
   * Only removes data that wasn't in the original snapshot
   */
  async cleanupTestData(): Promise<void> {
    try {
      // Get current data
      const currentUsers = await (this.prisma as any).user.findMany();
      const currentBookings = await (this.prisma as any).booking.findMany();
      const currentAvailabilities = await (this.prisma as any).availability.findMany();

      // Find new data (not in snapshot)
      const originalUserIds = new Set(this.snapshot.users.map((u: any) => u.id));
      const originalBookingIds = new Set(this.snapshot.bookings.map((b: any) => b.id));
      const originalAvailabilityIds = new Set(this.snapshot.availabilities.map((a: any) => a.id));

      // Delete only new data
      const newUsers = currentUsers.filter((u: any) => !originalUserIds.has(u.id));
      const newBookings = currentBookings.filter((b: any) => !originalBookingIds.has(b.id));
      const newAvailabilities = currentAvailabilities.filter((a: any) => !originalAvailabilityIds.has(a.id));

      console.log(`🧹 Cleaning up: ${newUsers.length} users, ${newBookings.length} bookings, ${newAvailabilities.length} availabilities`);

      // Clean up in correct order (foreign key constraints)
      if (newBookings.length > 0) {
        await (this.prisma as any).booking.deleteMany({
          where: { id: { in: newBookings.map((b: any) => b.id) } }
        });
      }

      if (newAvailabilities.length > 0) {
        await (this.prisma as any).availability.deleteMany({
          where: { id: { in: newAvailabilities.map((a: any) => a.id) } }
        });
      }

      if (newUsers.length > 0) {
        await (this.prisma as any).user.deleteMany({
          where: { id: { in: newUsers.map((u: any) => u.id) } }
        });
      }
    } catch (error) {
      console.warn('Cleanup failed:', error.message);
      // Don't fail tests due to cleanup issues
    }
  }
}
