import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adampainter.com' },
    update: {},
    create: {
      email: 'admin@adampainter.com',
      password: adminPassword,
      name: 'System Administrator',
      role: UserRole.ADMIN,
    },
  });

  // Create demo painters
  const painter1 = await prisma.user.upsert({
    where: { email: 'painter1@example.com' },
    update: {},
    create: {
      email: 'painter1@example.com',
      password: hashedPassword,
      name: 'Alice Johnson',
      role: UserRole.PAINTER,
    },
  });

  const painter2 = await prisma.user.upsert({
    where: { email: 'painter2@example.com' },
    update: {},
    create: {
      email: 'painter2@example.com',
      password: hashedPassword,
      name: 'Bob Smith',
      role: UserRole.PAINTER,
    },
  });

  // Create demo customers
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      email: 'customer1@example.com',
      password: hashedPassword,
      name: 'John Doe',
      role: UserRole.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      email: 'customer2@example.com',
      password: hashedPassword,
      name: 'Jane Wilson',
      role: UserRole.CUSTOMER,
    },
  });

  // Create some availability slots for painters
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(10, 0, 0, 0);

  await prisma.availability.createMany({
    data: [
      {
        painterId: painter1.id,
        startTime: new Date(tomorrow.getTime()),
        endTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // 4 hours
      },
      {
        painterId: painter1.id,
        startTime: new Date(dayAfter.getTime()),
        endTime: new Date(dayAfter.getTime() + 6 * 60 * 60 * 1000), // 6 hours
      },
      {
        painterId: painter2.id,
        startTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        endTime: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000), // 6 hours duration
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('Demo users created:');
  console.log('Admin: admin@adampainter.com (password: admin123)');
  console.log('Painters: painter1@example.com, painter2@example.com');
  console.log('Customers: customer1@example.com, customer2@example.com');
  console.log('Password for painters/customers: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
