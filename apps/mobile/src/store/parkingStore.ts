import { create } from 'zustand';
import * as Location from 'expo-location';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { Config } from '../constants/config';

export interface ParkingFacility {
  id: string;
  _id?: string;
  name: string;
  address: string;
  campusOrBuilding?: string;
  coordinates: { latitude: number; longitude: number };
  entranceCoordinates: { latitude: number; longitude: number };
  totalCapacity: number;
  currentOccupancy: number;
  availableSpaces: number;
  occupancyPercentage: number;
  hourlyRateCents: number;
  currency: string;
  status: 'open' | 'closed' | 'full' | 'maintenance';
  amenities: string[];
  zones?: any[];
  distanceKm?: number | null;
  recommendationScore?: number;
  recommendationReason?: string;
  isDemoData?: boolean;
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

export interface FacilityForecast {
  facilityId: string;
  facilityName: string;
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

export interface SavedLocationData {
  facilityId: string;
  facilityName: string;
  floor: string;
  zone: string;
  bay: string;
  pillarReference?: string;
  note?: string;
  gpsCoordinates?: { latitude: number; longitude: number };
  parkedAt: string;
}

interface ParkingState {
  facilities: ParkingFacility[];
  selectedFacility: ParkingFacility | null;
  forecast: FacilityForecast | null;
  recommendation: any | null;
  savedLocation: SavedLocationData | null;
  reservations: any[];
  userLocation: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  searchQuery: string;
  filters: {
    vehicleType?: 'car' | 'ev' | 'motorcycle';
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    sortBy?: 'nearest' | 'cheapest' | 'most_available' | 'recommendation';
  };

  initStore: () => Promise<void>;
  requestUserLocation: () => Promise<void>;
  fetchFacilities: () => Promise<void>;
  setSelectedFacility: (facility: ParkingFacility) => void;
  fetchForecast: (facilityId: string) => Promise<void>;
  fetchRecommendation: () => Promise<void>;
  fetchSavedLocation: () => Promise<void>;
  saveLocation: (data: SavedLocationData) => Promise<void>;
  clearSavedLocation: () => Promise<void>;
  fetchReservations: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<ParkingState['filters']>) => void;
  createReservation: (data: any) => Promise<any>;
  cancelReservation: (id: string) => Promise<void>;
}

export const useParkingStore = create<ParkingState>((set, get) => ({
  facilities: [],
  selectedFacility: null,
  forecast: null,
  recommendation: null,
  savedLocation: null,
  reservations: [],
  userLocation: Config.defaultGps,
  isLoading: false,
  searchQuery: '',
  filters: {
    sortBy: 'recommendation',
  },

  initStore: async () => {
    await get().requestUserLocation();
    await get().fetchFacilities();
    await get().fetchRecommendation();
    await get().fetchSavedLocation();
    await get().fetchReservations();

    // Socket.IO event listener for real-time occupancy updates
    socket.on('occupancy:update', (data: any) => {
      set((state) => {
        const updatedFacilities = state.facilities.map((fac) => {
          if (fac.id === data.facilityId || fac._id === data.facilityId) {
            return {
              ...fac,
              currentOccupancy: data.currentOccupancy,
              totalCapacity: data.totalCapacity,
              occupancyPercentage: data.occupancyPercentage,
              availableSpaces: data.availableSpaces,
            };
          }
          return fac;
        });

        const updatedSelected =
          state.selectedFacility &&
          (state.selectedFacility.id === data.facilityId || state.selectedFacility._id === data.facilityId)
            ? {
                ...state.selectedFacility,
                currentOccupancy: data.currentOccupancy,
                totalCapacity: data.totalCapacity,
                occupancyPercentage: data.occupancyPercentage,
                availableSpaces: data.availableSpaces,
              }
            : state.selectedFacility;

        return {
          facilities: updatedFacilities,
          selectedFacility: updatedSelected,
        };
      });
    });

    socket.on('reservation:update', (data: any) => {
      get().fetchReservations();
    });
  },

  requestUserLocation: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        set({
          userLocation: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          },
        });
      }
    } catch (e) {
      console.warn('GPS location request warning (using fallback coords):', e);
    }
  },

  fetchFacilities: async () => {
    set({ isLoading: true });
    try {
      const { searchQuery, filters, userLocation } = get();
      const params: Record<string, any> = {
        sortBy: filters.sortBy || 'recommendation',
      };

      if (searchQuery) params.q = searchQuery;
      if (filters.vehicleType) params.vehicleType = filters.vehicleType;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.amenities && filters.amenities.length > 0) {
        params.amenities = filters.amenities.join(',');
      }
      if (userLocation) {
        params.userLat = userLocation.latitude;
        params.userLng = userLocation.longitude;
      }

      const res = await api.get('/facilities', { params });
      const list = res.data.facilities || [];

      set({
        facilities: list,
        isLoading: false,
        selectedFacility: get().selectedFacility || list[0] || null,
      });

      if (list[0]) {
        get().fetchForecast(list[0].id || list[0]._id);
      }
    } catch (err) {
      set({ isLoading: false });
      console.warn('Error fetching facilities', err);
    }
  },

  setSelectedFacility: (facility: ParkingFacility) => {
    set({ selectedFacility: facility });
    get().fetchForecast(facility.id || (facility._id as string));
  },

  fetchForecast: async (facilityId: string) => {
    try {
      const res = await api.get(`/forecast/${facilityId}`);
      set({ forecast: res.data });
    } catch (err) {
      console.warn('Error fetching forecast', err);
    }
  },

  fetchRecommendation: async () => {
    try {
      const { userLocation } = get();
      const params: Record<string, any> = {};
      if (userLocation) {
        params.userLat = userLocation.latitude;
        params.userLng = userLocation.longitude;
      }
      const res = await api.get('/recommendations', { params });
      set({ recommendation: res.data.recommendation });
    } catch (err) {
      console.warn('Error fetching recommendation', err);
    }
  },

  fetchSavedLocation: async () => {
    try {
      const res = await api.get('/saved-location');
      set({ savedLocation: res.data.location || null });
    } catch (err) {
      // not logged in or no saved location
    }
  },

  saveLocation: async (data: SavedLocationData) => {
    const res = await api.post('/saved-location', data);
    set({ savedLocation: res.data.location });
  },

  clearSavedLocation: async () => {
    await api.delete('/saved-location');
    set({ savedLocation: null });
  },

  fetchReservations: async () => {
    try {
      const res = await api.get('/reservations');
      set({ reservations: res.data.reservations || [] });
    } catch (err) {
      // not logged in
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchFacilities();
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchFacilities();
  },

  createReservation: async (data: any) => {
    const res = await api.post('/reservations', data);
    await get().fetchReservations();
    return res.data;
  },

  cancelReservation: async (id: string) => {
    await api.post(`/reservations/${id}/cancel`);
    await get().fetchReservations();
  },
}));
