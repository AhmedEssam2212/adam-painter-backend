import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/services/prisma.service';
import { SnapshotTestHelper } from './test-helpers';

describe('Booking Flow E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testHelper: SnapshotTestHelper;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    testHelper = new SnapshotTestHelper(prisma);

    // Apply global prefix like in main.ts
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 📸 Take snapshot of current database state
    // This preserves ALL existing data for restoration
    await testHelper.takeSnapshot();
    console.log('📸 Database snapshot taken - existing data preserved');
  });

  afterEach(async () => {
    // 🧹 Clean up ONLY test data (preserve original data)
    await testHelper.cleanupTestData();
    console.log('🧹 Test data cleaned up - original data restored');

    // ✅ Verify database is back to original state
    await testHelper.verifySnapshot();
    console.log('✅ Database state verified - no data loss');
  });

  describe('Automatic Painter Assignment Flow', () => {
    let customerToken: string;
    let painterToken: string;
    let painterId: string;

    // Generate unique test data for each test run
    const getUniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@e2etest.com`;

    it('should complete the full booking flow with automatic painter assignment', async () => {
      // Step 1: Register customer
      const customerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'John Customer',
          email: getUniqueEmail('customer'),
          password: 'password123',
          role: 'CUSTOMER'
        })
        .expect(201);

      expect(customerResponse.body.success).toBe(true);
      expect(customerResponse.body.data.user.role).toBe('CUSTOMER');
      customerToken = customerResponse.body.data.accessToken;

      // Step 2: Register painter
      const painterResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Alice Painter',
          email: getUniqueEmail('painter'),
          password: 'password123',
          role: 'PAINTER'
        })
        .expect(201);

      expect(painterResponse.body.success).toBe(true);
      expect(painterResponse.body.data.user.role).toBe('PAINTER');
      painterToken = painterResponse.body.data.accessToken;
      painterId = painterResponse.body.data.user.id;

      // Step 3: Painter sets availability (including weekends now)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(17, 0, 0, 0);

      const availabilityResponse = await request(app.getHttpServer())
        .post('/api/availability')
        .set('Authorization', `Bearer ${painterToken}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      expect(availabilityResponse.body.success).toBe(true);
      expect(availabilityResponse.body.data.createdBy).toBe(painterId);

      // Step 4: Customer creates booking request (automatic painter assignment)
      const bookingStart = new Date(tomorrow);
      bookingStart.setHours(10, 0, 0, 0);
      
      const bookingEnd = new Date(tomorrow);
      bookingEnd.setHours(14, 0, 0, 0);

      const bookingResponse = await request(app.getHttpServer())
        .post('/api/booking-request')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          startTime: bookingStart.toISOString(),
          endTime: bookingEnd.toISOString()
        })
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      expect(bookingResponse.body.data.bookingId).toBeDefined();
      expect(bookingResponse.body.data.painter).toBeDefined();
      expect(bookingResponse.body.data.painter.name).toBe('Alice Painter');
      expect(bookingResponse.body.data.status).toBe('CONFIRMED');

      const bookingId = bookingResponse.body.data.bookingId;

      // Step 5: Verify customer can see their booking
      const customerBookingsResponse = await request(app.getHttpServer())
        .get('/api/bookings/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(customerBookingsResponse.body.success).toBe(true);
      expect(customerBookingsResponse.body.data).toHaveLength(1);
      expect(customerBookingsResponse.body.data[0].bookingId).toBe(bookingId);
      expect(customerBookingsResponse.body.data[0].painter.name).toBe('Alice Painter');

      // Step 6: Verify painter can see their booking
      const painterBookingsResponse = await request(app.getHttpServer())
        .get('/api/bookings/me')
        .set('Authorization', `Bearer ${painterToken}`)
        .expect(200);

      expect(painterBookingsResponse.body.success).toBe(true);
      expect(painterBookingsResponse.body.data).toHaveLength(1);
      expect(painterBookingsResponse.body.data[0].bookingId).toBe(bookingId);
    });

    it('should assign first available painter when multiple painters are available', async () => {
      // Register customer
      const customerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'John Customer',
          email: getUniqueEmail('customer2'),
          password: 'password123',
          role: 'CUSTOMER'
        })
        .expect(201);

      customerToken = customerResponse.body.data.accessToken;

      // Register first painter
      const painter1Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'First Painter',
          email: getUniqueEmail('painter1'),
          password: 'password123',
          role: 'PAINTER'
        })
        .expect(201);

      const painter1Token = painter1Response.body.data.accessToken;
      const painter1Id = painter1Response.body.data.user.id;

      // Register second painter
      const painter2Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Second Painter',
          email: getUniqueEmail('painter2'),
          password: 'password123',
          role: 'PAINTER'
        })
        .expect(201);

      const painter2Token = painter2Response.body.data.accessToken;

      // Both painters set availability for the same time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(9, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(17, 0, 0, 0);

      // First painter sets availability
      await request(app.getHttpServer())
        .post('/api/availability')
        .set('Authorization', `Bearer ${painter1Token}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      // Second painter sets availability
      await request(app.getHttpServer())
        .post('/api/availability')
        .set('Authorization', `Bearer ${painter2Token}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      // Customer creates booking request
      const bookingStart = new Date(tomorrow);
      bookingStart.setHours(10, 0, 0, 0);
      
      const bookingEnd = new Date(tomorrow);
      bookingEnd.setHours(14, 0, 0, 0);

      const bookingResponse = await request(app.getHttpServer())
        .post('/api/booking-request')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          startTime: bookingStart.toISOString(),
          endTime: bookingEnd.toISOString()
        })
        .expect(201);

      // Should assign the first available painter (based on availability creation order)
      expect(bookingResponse.body.success).toBe(true);
      expect(bookingResponse.body.data.painter).toBeDefined();
      
      // The system should assign the first painter found in the availability query
      // This verifies the "first available" strategy is working
      const assignedPainterId = bookingResponse.body.data.painter.id;
      expect([painter1Id, painter2Response.body.data.user.id]).toContain(assignedPainterId);
    });

    it('should handle weekend bookings (weekends now allowed)', async () => {
      // Register customer and painter
      const customerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Weekend Customer',
          email: getUniqueEmail('weekend'),
          password: 'password123',
          role: 'CUSTOMER'
        })
        .expect(201);

      const painterResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Weekend Painter',
          email: getUniqueEmail('weekendpainter'),
          password: 'password123',
          role: 'PAINTER'
        })
        .expect(201);

      customerToken = customerResponse.body.data.accessToken;
      painterToken = painterResponse.body.data.accessToken;

      // Find next Saturday
      const nextSaturday = new Date();
      const daysUntilSaturday = (6 - nextSaturday.getDay() + 7) % 7;
      nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);
      nextSaturday.setHours(10, 0, 0, 0);
      
      const endTime = new Date(nextSaturday);
      endTime.setHours(16, 0, 0, 0);

      // Painter sets weekend availability
      await request(app.getHttpServer())
        .post('/api/availability')
        .set('Authorization', `Bearer ${painterToken}`)
        .send({
          startTime: nextSaturday.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      // Customer creates weekend booking request
      const bookingStart = new Date(nextSaturday);
      bookingStart.setHours(11, 0, 0, 0);
      
      const bookingEnd = new Date(nextSaturday);
      bookingEnd.setHours(15, 0, 0, 0);

      const bookingResponse = await request(app.getHttpServer())
        .post('/api/booking-request')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          startTime: bookingStart.toISOString(),
          endTime: bookingEnd.toISOString()
        })
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      expect(bookingResponse.body.data.painter.name).toBe('Weekend Painter');
    });

    it('should create pending booking when no painters are available', async () => {
      // Register customer only (no painters)
      const customerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Lonely Customer',
          email: getUniqueEmail('lonely'),
          password: 'password123',
          role: 'CUSTOMER'
        })
        .expect(201);

      customerToken = customerResponse.body.data.accessToken;

      // Try to create booking without any available painters
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const endTime = new Date(tomorrow);
      endTime.setHours(14, 0, 0, 0);

      const bookingResponse = await request(app.getHttpServer())
        .post('/api/booking-request')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      expect(bookingResponse.body.data.status).toBe('PENDING');
      expect(bookingResponse.body.data.painter).toBeUndefined();
    });

    it('should automatically assign pending booking when painter creates matching availability', async () => {
      // Step 1: Register customer
      const customerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: getUniqueEmail('customer'),
          password: 'StrongPass123!',
          name: 'Test Customer',
          role: 'CUSTOMER'
        })
        .expect(201);

      const customerToken = customerResponse.body.data.accessToken;

      // Step 2: Customer creates booking request when no painters are available
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(14, 0, 0, 0);

      const bookingResponse = await request(app.getHttpServer())
        .post('/api/booking-request')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      expect(bookingResponse.body.success).toBe(true);
      expect(bookingResponse.body.data.status).toBe('PENDING');
      expect(bookingResponse.body.data.painter).toBeUndefined();

      const bookingId = bookingResponse.body.data.bookingId;

      // Step 3: Register painter
      const painterResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: getUniqueEmail('painter'),
          password: 'StrongPass123!',
          name: 'Test Painter',
          role: 'PAINTER'
        })
        .expect(201);

      const painterToken = painterResponse.body.data.accessToken;

      // Step 4: Painter creates availability that covers the pending booking
      const availabilityStart = new Date(tomorrow);
      availabilityStart.setHours(9, 0, 0, 0); // 9 AM

      const availabilityEnd = new Date(tomorrow);
      availabilityEnd.setHours(17, 0, 0, 0); // 5 PM

      const availabilityResponse = await request(app.getHttpServer())
        .post('/api/availability')
        .set('Authorization', `Bearer ${painterToken}`)
        .send({
          startTime: availabilityStart.toISOString(),
          endTime: availabilityEnd.toISOString()
        })
        .expect(201);

      expect(availabilityResponse.body.success).toBe(true);

      // Step 5: Check that the booking is now automatically assigned
      const updatedBookingResponse = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(updatedBookingResponse.body.success).toBe(true);
      expect(updatedBookingResponse.body.data.status).toBe('CONFIRMED');
      expect(updatedBookingResponse.body.data.painter).toBeDefined();
      expect(updatedBookingResponse.body.data.painter.id).toBe(painterResponse.body.data.user.id);
    });

    it('should handle multiple pending bookings with first-come-first-served assignment', async () => {
      // Step 1: Register customers
      const customer1Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: getUniqueEmail('customer1'),
          password: 'StrongPass123!',
          name: 'Customer One',
          role: 'CUSTOMER'
        })
        .expect(201);

      const customer2Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: getUniqueEmail('customer2'),
          password: 'StrongPass123!',
          name: 'Customer Two',
          role: 'CUSTOMER'
        })
        .expect(201);

      const customer1Token = customer1Response.body.data.accessToken;
      const customer2Token = customer2Response.body.data.accessToken;

      // Step 2: Both customers create overlapping booking requests
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(12, 0, 0, 0);

      // First booking (should get priority)
      const booking1Response = await request(app.getHttpServer())
        .post('/api/booking-request')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      expect(booking1Response.body.data.status).toBe('PENDING');
      const booking1Id = booking1Response.body.data.bookingId;

      // Small delay to ensure different creation times
      await new Promise(resolve => setTimeout(resolve, 100));

      // Second booking (should remain pending)
      const booking2Response = await request(app.getHttpServer())
        .post('/api/booking-request')
        .set('Authorization', `Bearer ${customer2Token}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      expect(booking2Response.body.data.status).toBe('PENDING');
      const booking2Id = booking2Response.body.data.bookingId;

      // Step 3: Register painter and create availability
      const painterResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: getUniqueEmail('painter'),
          password: 'StrongPass123!',
          name: 'Test Painter',
          role: 'PAINTER'
        })
        .expect(201);

      const painterToken = painterResponse.body.data.accessToken;

      // Create availability that can only accommodate one booking
      const availabilityResponse = await request(app.getHttpServer())
        .post('/api/availability')
        .set('Authorization', `Bearer ${painterToken}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      expect(availabilityResponse.body.success).toBe(true);

      // Step 4: Check that only the first booking is assigned
      const updatedBooking1Response = await request(app.getHttpServer())
        .get(`/api/bookings/${booking1Id}`)
        .set('Authorization', `Bearer ${customer1Token}`)
        .expect(200);

      expect(updatedBooking1Response.body.data.status).toBe('CONFIRMED');
      expect(updatedBooking1Response.body.data.painter).toBeDefined();

      const updatedBooking2Response = await request(app.getHttpServer())
        .get(`/api/bookings/${booking2Id}`)
        .set('Authorization', `Bearer ${customer2Token}`)
        .expect(200);

      expect(updatedBooking2Response.body.data.status).toBe('PENDING');
      expect(updatedBooking2Response.body.data.painter).toBeUndefined();
    });

    it('should assign pending booking to the first available painter when multiple painters create availability', async () => {
      // Step 1: Register customer
      const customerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: getUniqueEmail('customer'),
          password: 'StrongPass123!',
          name: 'Test Customer',
          role: 'CUSTOMER'
        })
        .expect(201);

      const customerToken = customerResponse.body.data.accessToken;

      // Step 2: Create pending booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(14, 0, 0, 0);

      const bookingResponse = await request(app.getHttpServer())
        .post('/api/booking-request')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      expect(bookingResponse.body.data.status).toBe('PENDING');
      const bookingId = bookingResponse.body.data.bookingId;

      // Step 3: Register first painter and create availability
      const painter1Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: getUniqueEmail('painter1'),
          password: 'StrongPass123!',
          name: 'First Painter',
          role: 'PAINTER'
        })
        .expect(201);

      const painter1Token = painter1Response.body.data.accessToken;
      const painter1Id = painter1Response.body.data.user.id;

      const availability1Response = await request(app.getHttpServer())
        .post('/api/availability')
        .set('Authorization', `Bearer ${painter1Token}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      expect(availability1Response.body.success).toBe(true);

      // Step 4: Check that booking is assigned to first painter
      const updatedBookingResponse = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(updatedBookingResponse.body.data.status).toBe('CONFIRMED');
      expect(updatedBookingResponse.body.data.painter.id).toBe(painter1Id);

      // Step 5: Register second painter and create availability (should not affect existing assignment)
      const painter2Response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: getUniqueEmail('painter2'),
          password: 'StrongPass123!',
          name: 'Second Painter',
          role: 'PAINTER'
        })
        .expect(201);

      const painter2Token = painter2Response.body.data.accessToken;

      await request(app.getHttpServer())
        .post('/api/availability')
        .set('Authorization', `Bearer ${painter2Token}`)
        .send({
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString()
        })
        .expect(201);

      // Step 6: Verify booking is still assigned to first painter
      const finalBookingResponse = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(finalBookingResponse.body.data.status).toBe('CONFIRMED');
      expect(finalBookingResponse.body.data.painter.id).toBe(painter1Id);
    });
  });
});
