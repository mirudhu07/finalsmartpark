export type UserRole = 'driver' | 'operator' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  type: 'car' | 'suv' | 'motorcycle' | 'ev' | 'van';
  isDefault: boolean;
  createdAt: string;
}

export type FacilityStatus = 'open' | 'closed' | 'full' | 'maintenance';

export interface ParkingCoordinates {
  latitude: number;
  longitude: number;
}

export interface ParkingZone {
  id: string;
  name: string;
  floor: string;
  totalSpaces: number;
  occupiedSpaces: number;
  type: 'standard' | 'ev' | 'accessible' | 'vip' | 'motorcycle';
  hourlyRate: number; // in cents (USD/currency minor unit)
}

export interface ParkingSpace {
  id: string;
  zoneId: string;
  bayNumber: string;
  isOccupied: boolean;
  type: 'standard' | 'ev' | 'accessible' | 'vip' | 'motorcycle';
  hasSensor: boolean;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  campusOrBuilding?: string;
  coordinates: ParkingCoordinates;
  entranceCoordinates: ParkingCoordinates;
  totalCapacity: number;
  currentOccupancy: number; // occupied spaces
  availableSpaces: number;
  occupancyPercentage: number;
  hourlyRateCents: number; // cents
  currency: string;
  status: FacilityStatus;
  amenities: string[]; // e.g. 'ev_charging', 'covered', 'cctv_security', 'wheelchair_accessible', 'valet'
  zones: ParkingZone[];
  isDemoData: boolean;
  lastUpdated: string;
}

export interface SavedVehicleLocation {
  facilityId: string;
  facilityName: string;
  floor: string;
  zone: string;
  bay: string;
  pillarReference?: string;
  note?: string;
  photoUrl?: string;
  gpsCoordinates?: ParkingCoordinates;
  parkedAt: string;
}

export interface ForecastPoint {
  minutesFromNow: number;
  predictedOccupancyPercentage: number;
  predictedOccupiedSpaces: number;
  predictedAvailableSpaces: number;
  confidenceLower: number;
  confidenceUpper: number;
  timestamp: string;
}

export interface ForecastResponse {
  facilityId: string;
  facilityCapacity: number;
  currentMeasuredOccupancyPercentage: number;
  forecastPoints: ForecastPoint[];
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  trendExplanation: string;
  uncertaintyScore: number;
  modelVersion: string;
  generatedAt: string;
  isDemoData: boolean;
}

export interface Recommendation {
  facility: Facility;
  distanceKm: number;
  score: number; // 0 - 100
  reason: string;
  predictedOccupancyAtArrival: number;
  estimatedPriceCents: number;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'expired';

export interface Reservation {
  id: string;
  bookingReference: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  zoneId?: string;
  zoneName?: string;
  spaceId?: string;
  bayNumber?: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  totalPriceCents: number;
  currency: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
}

export interface ParkingSession {
  id: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  vehiclePlate: string;
  entryTime: string;
  exitTime?: string;
  durationMinutes?: number;
  amountDueCents: number;
  isPaid: boolean;
  currency: string;
}

export interface OperationalIncident {
  id: string;
  facilityId: string;
  facilityName: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  reportedAt: string;
  resolvedAt?: string;
}

export interface AdminAnalytics {
  totalFacilities: number;
  totalCapacity: number;
  currentOccupied: number;
  systemOccupancyRate: number;
  activeReservationsCount: number;
  todayRevenueCents: number;
  recentIncidentsCount: number;
  modelEvaluation: {
    modelVersion: string;
    mae: number;
    rmse: number;
    holdoutAccuracy: number;
    lastTrainedAt: string;
  };
}
