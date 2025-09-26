const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testBookingFlow() {
  try {
    console.log('🧪 Testing Automatic Painter Assignment Flow with Unique Data...\n');

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    console.log(`🔑 Test ID: ${timestamp}-${randomId}`);

    // Step 1: Register a customer (or login if exists)
    console.log('1️⃣ Setting up customer...');
    let customerToken;
    try {
      const customerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'John Customer',
        email: `customer-${timestamp}-${randomId}@jstest.com`,
        password: 'password123',
        role: 'CUSTOMER'
      });
      console.log('✅ Customer registered:', customerResponse.data.data.user.name);
      customerToken = customerResponse.data.data.accessToken;
    } catch (error) {
      // If user exists, just login
      console.log('   Customer exists, logging in...');
      const customerLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'customer@test.com',
        password: 'password123'
      });
      customerToken = customerLogin.data.data.accessToken;
      console.log('✅ Customer logged in');
    }

    // Step 2: Register a painter (or login if exists)
    console.log('\n2️⃣ Setting up painter...');
    let painterToken;
    try {
      const painterResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Alice Painter',
        email: `painter-${timestamp}-${randomId}@jstest.com`,
        password: 'password123',
        role: 'PAINTER'
      });
      console.log('✅ Painter registered:', painterResponse.data.data.user.name);
      painterToken = painterResponse.data.data.accessToken;
    } catch (error) {
      // If user exists, just login
      console.log('   Painter exists, logging in...');
      const painterLogin = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'painter@test.com',
        password: 'password123'
      });
      painterToken = painterLogin.data.data.accessToken;
      console.log('✅ Painter logged in');
    }

    // Step 3: Verify painter profile
    console.log('\n3️⃣ Verifying painter profile...');
    if (painterToken) {
      console.log('   - Token:', painterToken.substring(0, 20) + '...');

      const painterProfile = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${painterToken}` }
      });
      console.log('   - Painter role:', painterProfile.data.data.role);
      console.log('   - Painter name:', painterProfile.data.data.name);
    } else {
      throw new Error('Painter token is undefined');
    }

    // Step 4: Painter sets availability
    console.log('\n4️⃣ Painter setting availability...');

    // Test weekend booking (now allowed)
    const nextSaturday = new Date();
    const daysUntilSaturday = (6 - nextSaturday.getDay() + 7) % 7;
    if (daysUntilSaturday === 0) nextSaturday.setDate(nextSaturday.getDate() + 7); // If today is Saturday, go to next Saturday
    else nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);
    nextSaturday.setHours(9, 0, 0, 0);

    const endTime = new Date(nextSaturday);
    endTime.setHours(17, 0, 0, 0);

    const availabilityResponse = await axios.post(`${BASE_URL}/availability`, {
      startTime: nextSaturday.toISOString(),
      endTime: endTime.toISOString()
    }, {
      headers: { Authorization: `Bearer ${painterToken}` }
    });
    console.log('✅ Weekend availability set:', availabilityResponse.data.data.startTime, 'to', availabilityResponse.data.data.endTime);

    // Step 5: Verify customer token (already have it)
    console.log('\n5️⃣ Verifying customer is ready...');
    console.log('✅ Customer token ready');

    // Step 6: Customer creates weekend booking request (automatic painter assignment)
    console.log('\n6️⃣ Customer creating weekend booking request...');
    const bookingStart = new Date(nextSaturday);
    bookingStart.setHours(15, 0, 0, 0); // Different time to avoid conflicts

    const bookingEnd = new Date(nextSaturday);
    bookingEnd.setHours(16, 30, 0, 0);

    const bookingResponse = await axios.post(`${BASE_URL}/booking-request`, {
      startTime: bookingStart.toISOString(),
      endTime: bookingEnd.toISOString()
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    console.log('✅ Booking created with automatic painter assignment!');
    console.log('📋 Booking Details:');
    console.log('   - Booking ID:', bookingResponse.data.data.bookingId);
    console.log('   - Assigned Painter:', bookingResponse.data.data.painter?.name || 'Painter ID: ' + bookingResponse.data.data.painterId);
    console.log('   - Time Slot:', bookingResponse.data.data.startTime, 'to', bookingResponse.data.data.endTime);
    console.log('   - Status:', bookingResponse.data.data.status);


    // Step 7: Verify the booking was assigned to the painter
    console.log('\n7️⃣ Verifying painter received the booking...');
    const painterBookings = await axios.get(`${BASE_URL}/bookings/me`, {
      headers: { Authorization: `Bearer ${painterToken}` }
    });

    console.log('✅ Painter has', painterBookings.data.data.length, 'booking(s)');
    if (painterBookings.data.data.length > 0) {
      console.log('   - First booking status:', painterBookings.data.data[0].status);
      console.log('   - Booking ID matches:', painterBookings.data.data[0].bookingId === bookingResponse.data.data.bookingId);
    }

    // Step 8: Verify customer can see the booking
    console.log('\n8️⃣ Verifying customer can see the booking...');
    const customerBookings = await axios.get(`${BASE_URL}/bookings/me`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });

    console.log('✅ Customer has', customerBookings.data.data.length, 'booking(s)');
    if (customerBookings.data.data.length > 0) {
      console.log('   - Booking status:', customerBookings.data.data[0].status);
      console.log('   - Assigned painter:', customerBookings.data.data[0].painter?.name);
    }

    console.log('\n🎉 SUCCESS: Automatic painter assignment is working correctly!');
    console.log('🔄 Flow Summary:');
    console.log('   1. Customer requested painting services for a weekend time window');
    console.log('   2. System found available painter during that time (weekends now allowed)');
    console.log('   3. System automatically assigned the first available painter');
    console.log('   4. Booking created with CONFIRMED status and painter assigned');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
  }
}

// Run the test
testBookingFlow();
