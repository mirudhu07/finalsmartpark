import { Request, Response, NextFunction } from 'express';
import { ParkingSession } from '../models/ParkingSession';
import { Facility } from '../models/Facility';

export async function getUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const sessions = await ParkingSession.find({ userId }).sort({ entryTime: -1 });
    res.status(200).json({ sessions });
  } catch (err) {
    next(err);
  }
}

export async function startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { facilityId, vehiclePlate } = req.body;

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    const session = await ParkingSession.create({
      userId,
      facilityId: facility._id,
      facilityName: facility.name,
      vehiclePlate: vehiclePlate.toUpperCase(),
      entryTime: new Date(),
      amountDueCents: facility.hourlyRateCents,
      currency: facility.currency || 'USD',
      isPaid: false,
    });

    res.status(201).json({ message: 'Parking session started', session });
  } catch (err) {
    next(err);
  }
}

export async function endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.body;
    const session = await ParkingSession.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const facility = await Facility.findById(session.facilityId);
    const exitTime = new Date();
    const durationMinutes = Math.max(1, Math.round((exitTime.getTime() - session.entryTime.getTime()) / 60000));
    const hours = Math.ceil(durationMinutes / 60);
    const rate = facility ? facility.hourlyRateCents : 400;
    const totalAmount = hours * rate;

    session.exitTime = exitTime;
    session.durationMinutes = durationMinutes;
    session.amountDueCents = totalAmount;
    await session.save();

    res.status(200).json({ message: 'Session ended', session });
  } catch (err) {
    next(err);
  }
}

export async function paySession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, paymentMethod = 'card_test' } = req.body;
    const session = await ParkingSession.findById(sessionId);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.isPaid) {
      res.status(400).json({ error: 'Session is already paid' });
      return;
    }

    // Sandbox test payment confirmation
    session.isPaid = true;
    session.paymentReference = `PAY-TEST-${Date.now()}`;
    await session.save();

    res.status(200).json({
      message: 'Payment processed successfully (Sandbox Mode)',
      session,
      receipt: {
        receiptNumber: `REC-${session.paymentReference}`,
        amountPaid: `$${(session.amountDueCents / 100).toFixed(2)}`,
        currency: session.currency,
        paidAt: new Date().toISOString(),
        paymentMethod,
        isTestPayment: true,
      },
    });
  } catch (err) {
    next(err);
  }
}
