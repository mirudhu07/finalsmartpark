import { Request, Response, NextFunction } from 'express';
import { Facility } from '../models/Facility';
import { config } from '../config';

export async function getPersonalizedRecommendation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userLat, userLng, vehicleType } = req.query;

    const facilities = await Facility.find({ status: 'open' });
    if (!facilities.length) {
      res.status(200).json({ recommendation: null });
      return;
    }

    const hasCoords = userLat !== undefined && userLng !== undefined;
    const uLat = hasCoords ? parseFloat(String(userLat)) : 37.7879;
    const uLng = hasCoords ? parseFloat(String(userLng)) : -122.4075;

    let bestFacility = facilities[0];
    let bestScore = -1;
    let bestReason = '';
    let predictedOccupancy = 60;

    for (const fac of facilities) {
      const available = Math.max(0, fac.totalCapacity - fac.currentOccupancy);
      const occPct = Math.round((fac.currentOccupancy / fac.totalCapacity) * 100);

      // Distance in km
      const dLat = ((fac.coordinates.latitude - uLat) * Math.PI) / 180;
      const dLon = ((fac.coordinates.longitude - uLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((uLat * Math.PI) / 180) *
          Math.cos((fac.coordinates.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const dist = Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;

      let score = 50;
      let reasons: string[] = [];

      if (available > 20) {
        score += 25;
        reasons.push(`${available} spaces open`);
      }
      if (occPct < 70) {
        score += 15;
      }
      if (dist < 3.0) {
        score += 20;
        reasons.push(`only ${dist} km away`);
      } else if (dist < 6.0) {
        score += 10;
      }

      if (vehicleType === 'ev' && fac.amenities.includes('ev_charging')) {
        score += 20;
        reasons.push('has dedicated EV charging bays');
      }

      if (fac.hourlyRateCents <= 500) {
        score += 10;
        reasons.push(`economical rate ($${(fac.hourlyRateCents / 100).toFixed(2)}/hr)`);
      }

      if (score > bestScore) {
        bestScore = score;
        bestFacility = fac;
        bestReason = reasons.join(', ') || 'Optimal combination of proximity and space availability';
        predictedOccupancy = occPct + 2;
      }
    }

    const availableSpaces = Math.max(0, bestFacility.totalCapacity - bestFacility.currentOccupancy);
    const occupancyPercentage = Math.round((bestFacility.currentOccupancy / bestFacility.totalCapacity) * 100);

    res.status(200).json({
      recommendation: {
        facility: {
          ...bestFacility.toObject(),
          id: bestFacility._id.toString(),
          availableSpaces,
          occupancyPercentage,
        },
        score: Math.min(98, bestScore),
        reason: `Recommended because it has ${bestReason}.`,
        predictedOccupancyAtArrival: predictedOccupancy,
        estimatedPriceCents: bestFacility.hourlyRateCents,
      },
    });
  } catch (err) {
    next(err);
  }
}
