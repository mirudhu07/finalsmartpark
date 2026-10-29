import { Request, Response, NextFunction } from 'express';
import { SavedLocation } from '../models/SavedLocation';

export async function saveLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { facilityId, facilityName, floor, zone, bay, pillarReference, note, photoUrl, gpsCoordinates } = req.body;

    const location = await SavedLocation.findOneAndUpdate(
      { userId },
      {
        userId,
        facilityId,
        facilityName,
        floor,
        zone,
        bay,
        pillarReference,
        note,
        photoUrl,
        gpsCoordinates,
        parkedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: 'Vehicle parked location saved successfully',
      location,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    const location = await SavedLocation.findOne({ userId });
    res.status(200).json({ location });
  } catch (err) {
    next(err);
  }
}

export async function clearLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    await SavedLocation.findOneAndDelete({ userId });
    res.status(200).json({ message: 'Saved vehicle location cleared' });
  } catch (err) {
    next(err);
  }
}
