import { Request, Response, NextFunction } from 'express';
import { Facility } from '../models/Facility';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function listFacilities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      q,
      status,
      minPrice,
      maxPrice,
      amenities,
      userLat,
      userLng,
      maxDistanceKm,
      vehicleType,
      sortBy = 'recommendation',
      page = 1,
      limit = 20,
    } = req.query;

    const filter: Record<string, any> = {};

    if (q) {
      const searchRegex = new RegExp(String(q), 'i');
      filter.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { campusOrBuilding: searchRegex },
        { 'zones.name': searchRegex },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (minPrice || maxPrice) {
      filter.hourlyRateCents = {};
      if (minPrice) filter.hourlyRateCents.$gte = parseInt(String(minPrice), 10);
      if (maxPrice) filter.hourlyRateCents.$lte = parseInt(String(maxPrice), 10);
    }

    if (amenities) {
      const amenityList = String(amenities).split(',');
      filter.amenities = { $all: amenityList };
    }

    if (vehicleType === 'ev') {
      filter.amenities = { $in: ['ev_charging'] };
    }

    const facilitiesDocs = await Facility.find(filter);

    const hasUserCoords = userLat !== undefined && userLng !== undefined;
    const uLat = hasUserCoords ? parseFloat(String(userLat)) : 0;
    const uLng = hasUserCoords ? parseFloat(String(userLng)) : 0;

    let facilities = facilitiesDocs.map((fac) => {
      const facObj = fac.toObject();
      const availableSpaces = Math.max(0, fac.totalCapacity - fac.currentOccupancy);
      const occupancyPercentage = Math.round((fac.currentOccupancy / fac.totalCapacity) * 100);

      const distanceKm = hasUserCoords
        ? calculateDistanceKm(uLat, uLng, fac.coordinates.latitude, fac.coordinates.longitude)
        : null;

      // Calculate transparent AI recommendation score (0 - 100)
      let score = 50;
      if (availableSpaces > 0) score += 20;
      if (occupancyPercentage < 70) score += 15;
      if (distanceKm !== null) {
        if (distanceKm < 2.0) score += 15;
        else if (distanceKm < 5.0) score += 5;
      }
      if (fac.hourlyRateCents <= 500) score += 10;

      return {
        ...facObj,
        id: fac._id.toString(),
        availableSpaces,
        occupancyPercentage,
        distanceKm,
        recommendationScore: Math.min(99, score),
        recommendationReason:
          occupancyPercentage < 65
            ? 'High availability and low predicted congestion'
            : distanceKm !== null && distanceKm < 2
            ? 'Closest facility to your location'
            : 'Favorable hourly rate and covered spaces',
      };
    });

    if (maxDistanceKm && hasUserCoords) {
      const maxD = parseFloat(String(maxDistanceKm));
      facilities = facilities.filter((f) => f.distanceKm !== null && f.distanceKm <= maxD);
    }

    // Sorting
    facilities.sort((a, b) => {
      if (sortBy === 'nearest' && hasUserCoords) {
        return (a.distanceKm || 999) - (b.distanceKm || 999);
      }
      if (sortBy === 'cheapest') {
        return a.hourlyRateCents - b.hourlyRateCents;
      }
      if (sortBy === 'most_available') {
        return b.availableSpaces - a.availableSpaces;
      }
      // default: recommendation
      return b.recommendationScore - a.recommendationScore;
    });

    // Pagination
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = facilities.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      facilities: paginated,
      total: facilities.length,
      page: pageNum,
      totalPages: Math.ceil(facilities.length / limitNum),
    });
  } catch (err) {
    next(err);
  }
}

export async function getFacilityById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const fac = await Facility.findById(id);
    if (!fac) {
      res.status(404).json({ error: 'Facility not found' });
      return;
    }

    const availableSpaces = Math.max(0, fac.totalCapacity - fac.currentOccupancy);
    const occupancyPercentage = Math.round((fac.currentOccupancy / fac.totalCapacity) * 100);

    res.status(200).json({
      facility: {
        ...fac.toObject(),
        id: fac._id.toString(),
        availableSpaces,
        occupancyPercentage,
      },
    });
  } catch (err) {
    next(err);
  }
}
