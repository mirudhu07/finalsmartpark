import { Request, Response, NextFunction } from 'express';
import { Vehicle } from '../models/Vehicle';

export async function getVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicles = await Vehicle.find({ userId: req.user?.userId }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ vehicles });
  } catch (err) {
    next(err);
  }
}

export async function addVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { make, model, licensePlate, color, type, isDefault } = req.body;

    if (isDefault) {
      await Vehicle.updateMany({ userId: req.user?.userId }, { isDefault: false });
    }

    const vehicle = await Vehicle.create({
      userId: req.user?.userId,
      make,
      model,
      licensePlate: licensePlate.toUpperCase(),
      color,
      type: type || 'car',
      isDefault: isDefault ?? false,
    });

    res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOneAndDelete({ _id: id, userId: req.user?.userId });
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found or unauthorized' });
      return;
    }
    res.status(200).json({ message: 'Vehicle removed successfully' });
  } catch (err) {
    next(err);
  }
}
