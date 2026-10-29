import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from './db';
import { User } from './models/User';
import { Vehicle } from './models/Vehicle';
import { Facility } from './models/Facility';
import { Reservation } from './models/Reservation';
import { ParkingSession } from './models/ParkingSession';
import { Incident } from './models/Incident';
import { SavedLocation } from './models/SavedLocation';

async function seed() {
  console.log('--------------------------------------------------');
  console.log(' Seeding SmartPark AI Database with Initial Data   ');
  console.log('--------------------------------------------------');

  await connectDatabase();

  // Clear existing collections safely
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Facility.deleteMany({}),
    Reservation.deleteMany({}),
    ParkingSession.deleteMany({}),
    Incident.deleteMany({}),
    SavedLocation.deleteMany({}),
  ]);

  console.log('1. Cleared existing records.');

  // Create Users with hashed passwords
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123456', salt);
  const operatorPass = await bcrypt.hash('Operator@123456', salt);
  const driverPass = await bcrypt.hash('Driver@123456', salt);

  const admin = await User.create({
    email: 'admin@smartpark.ai',
    name: 'Sarah Chen (System Admin)',
    passwordHash: adminPass,
    role: 'admin',
    phone: '+1 (415) 555-0100',
  });

  const operator = await User.create({
    email: 'operator@smartpark.ai',
    name: 'Marcus Miller (Facility Manager)',
    passwordHash: operatorPass,
    role: 'operator',
    phone: '+1 (415) 555-0101',
  });

  const driver = await User.create({
    email: 'driver@smartpark.ai',
    name: 'Alex Rivera',
    passwordHash: driverPass,
    role: 'driver',
    phone: '+1 (415) 555-0102',
    preferences: {
      notificationsEnabled: true,
      evOnly: true,
      preferredPaymentMethod: 'apple_pay',
    },
  });

  console.log('2. Seeded Users (Admin, Operator, Driver).');

  // Seed Vehicles for Driver
  const v1 = await Vehicle.create({
    userId: driver._id,
    make: 'Tesla',
    model: 'Model 3',
    licensePlate: '7EV-PARK',
    color: 'Pearl White',
    type: 'ev',
    isDefault: true,
  });

  const v2 = await Vehicle.create({
    userId: driver._id,
    make: 'Honda',
    model: 'Civic',
    licensePlate: '5XYZ890',
    color: 'Sonic Gray',
    type: 'car',
    isDefault: false,
  });

  console.log('3. Seeded Vehicles for Driver.');

  // Seed Facilities with verified San Francisco coordinates
  const fac1 = await Facility.create({
    name: 'Tech Park Center Garage',
    address: '450 Mission St, Financial District, San Francisco, CA 94105',
    campusOrBuilding: 'Salesforce Tech Center West',
    coordinates: { latitude: 37.789172, longitude: -122.401449 },
    entranceCoordinates: { latitude: 37.789172, longitude: -122.401449 },
    totalCapacity: 500,
    currentOccupancy: 320, // 64% occupied
    hourlyRateCents: 450, // $4.50
    currency: 'USD',
    status: 'open',
    amenities: ['ev_charging', 'covered', 'cctv_security', 'wheelchair_accessible', 'reservation_supported'],
    isDemoData: true,
    zones: [
      { name: 'Level 1 - EV Fast Charge', floor: 'L1', totalSpaces: 80, occupiedSpaces: 52, type: 'ev', hourlyRate: 500 },
      { name: 'Level 2 - General Parking', floor: 'L2', totalSpaces: 220, occupiedSpaces: 140, type: 'standard', hourlyRate: 450 },
      { name: 'Level 3 - Express Covered', floor: 'L3', totalSpaces: 200, occupiedSpaces: 128, type: 'standard', hourlyRate: 450 },
    ],
  });

  const fac2 = await Facility.create({
    name: 'Civic Plaza Grand Parking',
    address: '355 McAllister St, Civic Center, San Francisco, CA 94102',
    campusOrBuilding: 'City Hall Civic Complex',
    coordinates: { latitude: 37.77928, longitude: -122.41832 },
    entranceCoordinates: { latitude: 37.77928, longitude: -122.41832 },
    totalCapacity: 850,
    currentOccupancy: 460, // 54% occupied
    hourlyRateCents: 350, // $3.50
    currency: 'USD',
    status: 'open',
    amenities: ['covered', 'cctv_security', 'wheelchair_accessible', 'reservation_supported'],
    isDemoData: true,
    zones: [
      { name: 'Ground Deck A', floor: 'G', totalSpaces: 250, occupiedSpaces: 120, type: 'standard', hourlyRate: 350 },
      { name: 'Underground Level B', floor: 'B1', totalSpaces: 300, occupiedSpaces: 160, type: 'standard', hourlyRate: 350 },
      { name: 'Underground Level C', floor: 'B2', totalSpaces: 300, occupiedSpaces: 180, type: 'standard', hourlyRate: 300 },
    ],
  });

  const fac3 = await Facility.create({
    name: 'Metro Transit Central Hub',
    address: '725 Market St, SoMa, San Francisco, CA 94103',
    campusOrBuilding: 'Montgomery Transit concourse',
    coordinates: { latitude: 37.78306, longitude: -122.40755 },
    entranceCoordinates: { latitude: 37.78306, longitude: -122.40755 },
    totalCapacity: 1200,
    currentOccupancy: 890, // 74% occupied
    hourlyRateCents: 500, // $5.00
    currency: 'USD',
    status: 'open',
    amenities: ['valet', 'ev_charging', 'cctv_security', 'covered', 'reservation_supported'],
    isDemoData: true,
    zones: [
      { name: 'Concourse Valet Deck', floor: 'L1', totalSpaces: 300, occupiedSpaces: 250, type: 'vip', hourlyRate: 750 },
      { name: 'EV Supercharger Row', floor: 'L2', totalSpaces: 150, occupiedSpaces: 110, type: 'ev', hourlyRate: 550 },
      { name: 'Main Commuter Floors', floor: 'L3-L6', totalSpaces: 750, occupiedSpaces: 530, type: 'standard', hourlyRate: 500 },
    ],
  });

  const fac4 = await Facility.create({
    name: 'Embarcadero Waterfront Bay Garage',
    address: 'Pier 14, The Embarcadero, San Francisco, CA 94105',
    campusOrBuilding: 'Waterfront Promenade Bay',
    coordinates: { latitude: 37.79461, longitude: -122.39318 },
    entranceCoordinates: { latitude: 37.79461, longitude: -122.39318 },
    totalCapacity: 350,
    currentOccupancy: 140, // 40% occupied
    hourlyRateCents: 600, // $6.00
    currency: 'USD',
    status: 'open',
    amenities: ['ev_charging', 'wheelchair_accessible', 'reservation_supported'],
    isDemoData: true,
    zones: [
      { name: 'Bayside Surface Deck', floor: 'Surface', totalSpaces: 150, occupiedSpaces: 60, type: 'standard', hourlyRate: 600 },
      { name: 'Pier EV Charging Pier', floor: 'Surface', totalSpaces: 50, occupiedSpaces: 25, type: 'ev', hourlyRate: 650 },
      { name: 'Rooftop Panoramic View', floor: 'Roof', totalSpaces: 150, occupiedSpaces: 55, type: 'standard', hourlyRate: 600 },
    ],
  });

  console.log('4. Seeded 4 major parking facilities.');

  // Seed Find My Vehicle for Driver
  await SavedLocation.create({
    userId: driver._id,
    facilityId: fac1._id,
    facilityName: fac1.name,
    floor: 'Level 2',
    zone: 'Zone B - Blue Pillars',
    bay: 'Bay 214',
    pillarReference: 'Pillar B-14 near East Elevators',
    note: 'Parked next to the EV rapid charging row',
    gpsCoordinates: { latitude: 37.789172, longitude: -122.401449 },
    parkedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
  });

  console.log('5. Seeded active Find My Vehicle location.');

  // Seed Reservations
  const now = new Date();
  await Reservation.create({
    bookingReference: 'SP-2026-T89A2',
    userId: driver._id,
    facilityId: fac1._id,
    facilityName: fac1.name,
    zoneName: 'Level 1 - EV Fast Charge',
    vehiclePlate: '7EV-PARK',
    startTime: new Date(now.getTime() + 60 * 60 * 1000), // in 1 hour
    endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // for 3 hours
    totalPriceCents: 1500, // $15.00
    currency: 'USD',
    status: 'confirmed',
  });

  await Reservation.create({
    bookingReference: 'SP-2026-M41C9',
    userId: driver._id,
    facilityId: fac3._id,
    facilityName: fac3.name,
    zoneName: 'Main Commuter Floors',
    vehiclePlate: '7EV-PARK',
    startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 44 * 60 * 60 * 1000),
    totalPriceCents: 2000,
    currency: 'USD',
    status: 'completed',
  });

  console.log('6. Seeded reservations (Active and Completed).');

  // Seed Parking Sessions
  await ParkingSession.create({
    userId: driver._id,
    facilityId: fac1._id,
    facilityName: fac1.name,
    vehiclePlate: '7EV-PARK',
    entryTime: new Date(now.getTime() - 45 * 60 * 1000),
    amountDueCents: 450,
    isPaid: false,
    currency: 'USD',
  });

  await ParkingSession.create({
    userId: driver._id,
    facilityId: fac2._id,
    facilityName: fac2.name,
    vehiclePlate: '7EV-PARK',
    entryTime: new Date(now.getTime() - 72 * 60 * 60 * 1000),
    exitTime: new Date(now.getTime() - 69 * 60 * 60 * 1000),
    durationMinutes: 180,
    amountDueCents: 1050,
    isPaid: true,
    paymentReference: 'PAY-TEST-998124',
    currency: 'USD',
  });

  console.log('7. Seeded parking sessions.');

  // Seed Operational Incident
  await Incident.create({
    facilityId: fac3._id,
    facilityName: fac3.name,
    title: 'EV Charger Station #4 Connector Service Required',
    description: 'Connector locking mechanism on EV Station #4 flagged intermittent error.',
    severity: 'medium',
    status: 'open',
    reportedBy: operator._id,
  });

  console.log('8. Seeded operational incident.');

  console.log('--------------------------------------------------');
  console.log(' Seeding completed successfully!                  ');
  console.log(' Test Credentials:                                ');
  console.log(' - Admin    : admin@smartpark.ai    / Admin@123456');
  console.log(' - Operator : operator@smartpark.ai / Operator@123456');
  console.log(' - Driver   : driver@smartpark.ai   / Driver@123456');
  console.log('--------------------------------------------------');

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
