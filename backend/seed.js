/**
 * Seed Script
 * Populates the database with sample data for development and testing.
 * 
 * Creates:
 * - 1 admin + 2 citizen accounts
 * - 2 government offices
 * - Services for each office
 * - Counters for each office
 * - ~50 completed token records (synthetic training data for ML)
 * 
 * Usage: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Office = require('./models/Office');
const Service = require('./models/Service');
const Counter = require('./models/Counter');
const Token = require('./models/Token');

dotenv.config();

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

// Helper: random integer between min and max (inclusive)
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: random element from array
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Office.deleteMany({});
    await Service.deleteMany({});
    await Counter.deleteMany({});
    await Token.deleteMany({});

    // ============================
    // 1. Create Users
    // ============================
    console.log('Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@queue.com',
      password: 'admin123',
      phone: '9876543210',
      role: 'admin'
    });

    const citizen1 = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul@example.com',
      password: 'citizen123',
      phone: '9876543211',
      role: 'citizen'
    });

    const citizen2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'citizen123',
      phone: '9876543212',
      role: 'citizen'
    });

    console.log('  ✓ Admin: admin@queue.com / admin123');
    console.log('  ✓ Citizen: rahul@example.com / citizen123');
    console.log('  ✓ Citizen: priya@example.com / citizen123');

    // ============================
    // 2. Create Offices
    // ============================
    console.log('Creating offices...');

    const office1 = await Office.create({
      name: 'Regional Passport Office',
      address: 'MG Road, Sector 12',
      city: 'Bangalore',
      operatingHours: { open: '09:00', close: '17:00' },
      totalCounters: 5
    });

    const office2 = await Office.create({
      name: 'District RTO Office',
      address: 'Station Road, Block A',
      city: 'Bangalore',
      operatingHours: { open: '10:00', close: '16:00' },
      totalCounters: 4
    });

    console.log('  ✓ Regional Passport Office');
    console.log('  ✓ District RTO Office');

    // ============================
    // 3. Create Services
    // ============================
    console.log('Creating services...');

    const services1 = await Service.insertMany([
      { name: 'New Passport Application', description: 'Apply for a new passport', office: office1._id, avgServiceDuration: 20 },
      { name: 'Passport Renewal', description: 'Renew existing passport', office: office1._id, avgServiceDuration: 15 },
      { name: 'Tatkal Passport', description: 'Urgent passport processing', office: office1._id, avgServiceDuration: 25 },
      { name: 'Address Change', description: 'Update address on passport', office: office1._id, avgServiceDuration: 10 }
    ]);

    const services2 = await Service.insertMany([
      { name: 'New Driving License', description: 'Apply for new DL', office: office2._id, avgServiceDuration: 30 },
      { name: 'License Renewal', description: 'Renew driving license', office: office2._id, avgServiceDuration: 15 },
      { name: 'Vehicle Registration', description: 'Register a new vehicle', office: office2._id, avgServiceDuration: 25 },
      { name: 'Transfer of Ownership', description: 'Transfer vehicle ownership', office: office2._id, avgServiceDuration: 20 }
    ]);

    const allServices = [...services1, ...services2];
    console.log(`  ✓ Created ${allServices.length} services`);

    // ============================
    // 4. Create Counters
    // ============================
    console.log('Creating counters...');

    const counters1 = [];
    for (let i = 1; i <= 5; i++) {
      counters1.push(await Counter.create({
        counterNumber: i,
        office: office1._id,
        status: i <= 3 ? 'active' : 'inactive' // 3 active, 2 inactive
      }));
    }

    const counters2 = [];
    for (let i = 1; i <= 4; i++) {
      counters2.push(await Counter.create({
        counterNumber: i,
        office: office2._id,
        status: i <= 2 ? 'active' : 'inactive' // 2 active, 2 inactive
      }));
    }

    console.log(`  ✓ Created ${counters1.length + counters2.length} counters`);

    // ============================
    // 5. Create Synthetic Training Data
    // ============================
    console.log('Generating synthetic training data...');

    const citizens = [citizen1, citizen2];
    const offices = [
      { office: office1, services: services1, counters: counters1 },
      { office: office2, services: services2, counters: counters2 }
    ];

    const tokenRecords = [];

    // Generate 50 completed tokens spread over the last 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];

      // ~7 tokens per day
      const tokensPerDay = randInt(5, 10);

      for (let t = 0; t < tokensPerDay; t++) {
        const officeData = randPick(offices);
        const service = randPick(officeData.services);
        const counter = randPick(officeData.counters);
        const citizen = randPick(citizens);

        // Simulate realistic times
        const arrivalHour = randInt(9, 15);
        const arrivalMinute = randInt(0, 59);

        const arrivalTime = new Date(date);
        arrivalTime.setHours(arrivalHour, arrivalMinute, 0, 0);

        // Queue position affects waiting time
        const queuePosition = randInt(1, 12);
        const activeCounters = randInt(2, officeData.office.totalCounters);

        // Simulate waiting time: depends on queue length and active counters
        const baseWait = (queuePosition / activeCounters) * service.avgServiceDuration;
        const jitter = randInt(-5, 10);
        const actualWaitingTime = Math.max(1, Math.round(baseWait + jitter));

        // Service start time = arrival + waiting
        const serviceStartTime = new Date(arrivalTime.getTime() + actualWaitingTime * 60 * 1000);

        // Service duration with some variability
        const serviceDuration = Math.max(5, service.avgServiceDuration + randInt(-5, 10));
        const serviceEndTime = new Date(serviceStartTime.getTime() + serviceDuration * 60 * 1000);

        tokenRecords.push({
          tokenNumber: `A${String(t + 1).padStart(3, '0')}`,
          citizen: citizen._id,
          office: officeData.office._id,
          service: service._id,
          counter: counter._id,
          status: 'completed',
          arrivalTime,
          serviceStartTime,
          serviceEndTime,
          actualWaitingTime,
          serviceDuration,
          queuePosition,
          date: dateStr
        });
      }
    }

    await Token.insertMany(tokenRecords);
    console.log(`  ✓ Created ${tokenRecords.length} completed token records (training data)`);

    // ============================
    // Summary
    // ============================
    console.log('\n============================');
    console.log('  SEED COMPLETED SUCCESSFULLY');
    console.log('============================');
    console.log(`  Users:    3 (1 admin, 2 citizens)`);
    console.log(`  Offices:  2`);
    console.log(`  Services: ${allServices.length}`);
    console.log(`  Counters: ${counters1.length + counters2.length}`);
    console.log(`  Tokens:   ${tokenRecords.length} (training data)`);
    console.log('\n  Login credentials:');
    console.log('  Admin:   admin@queue.com / admin123');
    console.log('  Citizen: rahul@example.com / citizen123');
    console.log('  Citizen: priya@example.com / citizen123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
