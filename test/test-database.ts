import { PrismaClient } from '@prisma/client';

// In-memory SQLite database for tests (completely isolated)
export const createTestDatabase = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: 'file:./test.db', // SQLite file for tests
      },
    },
  });
};

// Alternative: In-memory database (no file)
export const createInMemoryDatabase = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: 'file::memory:?cache=shared', // Completely in-memory
      },
    },
  });
};
