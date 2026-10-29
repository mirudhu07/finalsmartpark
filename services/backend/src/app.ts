import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { isDbConnected } from './db';
import { errorHandler } from './middleware/errorHandler';
import { authenticate, requireRole } from './middleware/auth';
import { validateBody } from './middleware/validation';

import {
  registerSchema,
  loginSchema,
  vehicleSchema,
  savedVehicleLocationSchema,
  reservationCreateSchema,
  facilityCreateSchema,
} from '@smartpark/shared';

// Controllers
import * as authCtrl from './controllers/authController';
import * as vehicleCtrl from './controllers/vehicleController';
import * as facilityCtrl from './controllers/facilityController';
import * as forecastCtrl from './controllers/forecastController';
import * as recCtrl from './controllers/recommendationController';
import * as savedLocCtrl from './controllers/savedLocationController';
import * as resCtrl from './controllers/reservationController';
import * as sessionCtrl from './controllers/sessionController';
import * as adminCtrl from './controllers/adminController';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow mobile apps, local tools, and configured dashboard origins
        if (!origin || config.corsOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(null, true); // Dev-friendly permissive CORS
        }
      },
      credentials: true,
    })
  );

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate Limiting on Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' },
  });

  const apiRouter = express.Router();

  // Health and Readiness Checks
  apiRouter.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'smartpark-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    });
  });

  apiRouter.get('/ready', (req: Request, res: Response) => {
    const dbOk = isDbConnected();
    if (!dbOk) {
      res.status(503).json({
        status: 'unready',
        databaseConnected: false,
        error: 'Database connection is not established',
      });
      return;
    }
    res.status(200).json({
      status: 'ready',
      databaseConnected: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Auth Routes
  apiRouter.post('/auth/register', authLimiter, validateBody(registerSchema), authCtrl.register);
  apiRouter.post('/auth/login', authLimiter, validateBody(loginSchema), authCtrl.login);
  apiRouter.post('/auth/refresh', authCtrl.refreshToken);
  apiRouter.post('/auth/password-reset', authCtrl.requestPasswordReset);
  apiRouter.get('/auth/profile', authenticate, authCtrl.getProfile);
  apiRouter.put('/auth/profile', authenticate, authCtrl.updateProfile);

  // Vehicle Routes
  apiRouter.get('/vehicles', authenticate, vehicleCtrl.getVehicles);
  apiRouter.post('/vehicles', authenticate, validateBody(vehicleSchema), vehicleCtrl.addVehicle);
  apiRouter.delete('/vehicles/:id', authenticate, vehicleCtrl.deleteVehicle);

  // Facilities & Search
  apiRouter.get('/facilities', facilityCtrl.listFacilities);
  apiRouter.get('/facilities/:id', facilityCtrl.getFacilityById);

  // Forecast & Recommendations
  apiRouter.get('/forecast/:facilityId', forecastCtrl.getFacilityForecast);
  apiRouter.get('/recommendations', recCtrl.getPersonalizedRecommendation);

  // Find My Vehicle (Saved Location)
  apiRouter.get('/saved-location', authenticate, savedLocCtrl.getLocation);
  apiRouter.post(
    '/saved-location',
    authenticate,
    validateBody(savedVehicleLocationSchema),
    savedLocCtrl.saveLocation
  );
  apiRouter.delete('/saved-location', authenticate, savedLocCtrl.clearLocation);

  // Reservations
  apiRouter.post(
    '/reservations',
    authenticate,
    validateBody(reservationCreateSchema),
    resCtrl.createReservation
  );
  apiRouter.get('/reservations', authenticate, resCtrl.getUserReservations);
  apiRouter.post('/reservations/:id/cancel', authenticate, resCtrl.cancelReservation);

  // Sessions & Payments
  apiRouter.get('/sessions', authenticate, sessionCtrl.getUserSessions);
  apiRouter.post('/sessions/start', authenticate, sessionCtrl.startSession);
  apiRouter.post('/sessions/end', authenticate, sessionCtrl.endSession);
  apiRouter.post('/sessions/pay', authenticate, sessionCtrl.paySession);

  // Admin Routes (Role Protected)
  const adminAuth = [authenticate, requireRole(['admin', 'operator'])];
  apiRouter.get('/admin/analytics', adminAuth, adminCtrl.getDashboardAnalytics);
  apiRouter.post('/admin/facilities', adminAuth, validateBody(facilityCreateSchema), adminCtrl.createFacility);
  apiRouter.put('/admin/facilities/:id', adminAuth, adminCtrl.updateFacility);
  apiRouter.post('/admin/facilities/:id/occupancy', adminAuth, adminCtrl.updateOccupancy);
  apiRouter.get('/admin/incidents', adminAuth, adminCtrl.getIncidents);
  apiRouter.put('/admin/incidents/:id/resolve', adminAuth, adminCtrl.resolveIncident);
  apiRouter.get('/admin/audit-logs', [authenticate, requireRole(['admin'])], adminCtrl.getAuditLogs);

  // Mount API router at /api/v1 and /api
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
