import { Request, Response, NextFunction } from 'express';
import { Reservation } from '../models/Reservation';
import { Facility } from '../models/Facility';
import { emitReservationUpdate } from '../socket';

function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SP-2026-${code}`;
}

export async function createReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { facilityId, zoneName, vehiclePlate, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      res.status(400).json({ error: 'Invalid start or end time. Start time must be before end time.' });
      return;
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    if (facility.status !== 'open') {
      res.status(400).json({ error: `Facility is currently ${facility.status}. Reservations not available.` });
      return;
    }

    // Concurrency / Capacity validation: check conflicting reservations
    const overlappingReservationsCount = await Reservation.countDocuments({
      facilityId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });

    if (facility.currentOccupancy + overlappingReservationsCount >= facility.totalCapacity) {
      res.status(409).json({
        error: 'Facility has reached capacity for the selected time window. Please select another slot or facility.',
      });
      return;
    }

    // Pricing calculation
    const durationHours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
    const totalPriceCents = durationHours * facility.hourlyRateCents;

    let bookingRef = generateBookingReference();
    let collision = await Reservation.findOne({ bookingReference: bookingRef });
    while (collision) {
      bookingRef = generateBookingReference();
      collision = await Reservation.findOne({ bookingReference: bookingRef });
    }

    const reservation = await Reservation.create({
      bookingReference: bookingRef,
      userId,
      facilityId: facility._id,
      facilityName: facility.name,
      zoneName: zoneName || 'Standard Deck',
      vehiclePlate: vehiclePlate.toUpperCase(),
      startTime: start,
      endTime: end,
      totalPriceCents,
      currency: facility.currency || 'USD',
      status: 'confirmed',
    });

    emitReservationUpdate(reservation.toObject());

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const reservations = await Reservation.find({ userId }).sort({ startTime: -1 });
    res.status(200).json({ reservations });
  } catch (err) {
    next(err);
  }
}

export async function cancelReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const reservation = await Reservation.findOne({ _id: id, userId });
    if (!reservation) {
      res.status(404).json({ error: 'Reservation not found or unauthorized' });
      return;
    }

    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      res.status(400).json({ error: `Cannot cancel reservation in '${reservation.status}' state.` });
      return;
    }

    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    await reservation.save();

    emitReservationUpdate(reservation.toObject());

    res.status(200).json({
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (err) {
    next(err);
  }
}
