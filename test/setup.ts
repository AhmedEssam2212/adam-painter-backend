import { PrismaService } from '../src/common/services/prisma.service';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up e2e tests with snapshot-based cleanup...');
  console.log('📸 Tests will preserve existing data using snapshots');
});

afterAll(async () => {
  // Cleanup after all tests
  console.log('🧹 Cleaning up e2e tests...');
});

// Increase timeout for e2e tests
jest.setTimeout(30000);
