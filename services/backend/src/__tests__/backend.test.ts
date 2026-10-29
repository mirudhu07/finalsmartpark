import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';
import { connectDatabase } from '../db';
import { User } from '../models/User';
import { Facility } from '../models/Facility';
import { Reservation } from '../models/Reservation';

const app = createApp();

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('SmartPark AI Backend REST API Tests', () => {
  let driverToken = '';
  let adminToken = '';
  let testFacilityId = '';

  it('GET /api/v1/health should return healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/ready should confirm database is connected', async () => {
    const res = await request(app).get('/api/v1/ready');
    expect(res.status).toBe(200);
    expect(res.body.databaseConnected).toBe(true);
  });

  it('POST /api/v1/auth/register should create a new driver user', async () => {
    const email = `test_driver_${Date.now()}@smartpark.ai`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'Password@123',
        name: 'Automated Tester',
        role: 'driver',
      });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(email);
    driverToken = res.body.accessToken;
  });

  it('POST /api/v1/auth/register should create an admin user', async () => {
    const email = `test_admin_${Date.now()}@smartpark.ai`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'AdminPassword@123',
        name: 'Admin Tester',
        role: 'admin',
      });

    expect(res.status).toBe(201);
    adminToken = res.body.accessToken;
  });

  it('POST /api/v1/auth/login with wrong password should fail with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'driver@smartpark.ai',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/facilities should return list of parking facilities', async () => {
    const res = await request(app).get('/api/v1/facilities');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.facilities)).toBe(true);
    if (res.body.facilities.length > 0) {
      testFacilityId = res.body.facilities[0].id;
      expect(res.body.facilities[0].availableSpaces).toBeDefined();
      expect(res.body.facilities[0].occupancyPercentage).toBeDefined();
    }
  });

  it('GET /api/v1/facilities with query search should filter properly', async () => {
    const res = await request(app).get('/api/v1/facilities?q=Tech');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.facilities)).toBe(true);
  });

  it('GET /api/v1/recommendations should return transparent personalized recommendation', async () => {
    const res = await request(app).get('/api/v1/recommendations?userLat=37.789&userLng=-122.401');
    expect(res.status).toBe(200);
    if (res.body.recommendation) {
      expect(res.body.recommendation.score).toBeGreaterThan(0);
      expect(res.body.recommendation.reason).toBeDefined();
    }
  });

  it('POST /api/v1/admin/analytics should be forbidden for driver role (403)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${driverToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/v1/admin/analytics should succeed for admin role (200)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.analytics).toBeDefined();
    expect(res.body.analytics.totalCapacity).toBeGreaterThanOrEqual(0);
  });
});
