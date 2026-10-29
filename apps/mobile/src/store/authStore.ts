import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'driver' | 'operator' | 'admin';
  phone?: string;
  preferences?: {
    notificationsEnabled: boolean;
    evOnly: boolean;
    preferredPaymentMethod?: string;
  };
}

export interface Vehicle {
  _id: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  type: 'car' | 'suv' | 'motorcycle' | 'ev' | 'van';
  isDefault: boolean;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  vehicles: Vehicle[];
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  addVehicle: (data: Omit<Vehicle, '_id'>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  vehicles: [],
  isLoading: true,

  restoreSession: async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('smartpark_user_token');
      const savedUser = await SecureStore.getItemAsync('smartpark_user_profile');

      if (savedToken && savedUser) {
        set({ token: savedToken, user: JSON.parse(savedUser) });
        // Fetch fresh profile and vehicles
        try {
          const profileRes = await api.get('/auth/profile');
          if (profileRes.data.user) {
            set({ user: profileRes.data.user });
            await SecureStore.setItemAsync('smartpark_user_profile', JSON.stringify(profileRes.data.user));
          }
          await get().fetchVehicles();
        } catch (e) {
          // Token might be expired
        }
      }
    } catch (e) {
      console.warn('Session restoration error', e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      const { user, accessToken } = res.data;

      await SecureStore.setItemAsync('smartpark_user_token', accessToken);
      await SecureStore.setItemAsync('smartpark_user_profile', JSON.stringify(user));

      set({ user, token: accessToken, isLoading: false });
      await get().fetchVehicles();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (name: string, email: string, pass: string, phone?: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', { name, email, password: pass, phone, role: 'driver' });
      const { user, accessToken } = res.data;

      await SecureStore.setItemAsync('smartpark_user_token', accessToken);
      await SecureStore.setItemAsync('smartpark_user_profile', JSON.stringify(user));

      set({ user, token: accessToken, isLoading: false });
      await get().fetchVehicles();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('smartpark_user_token');
      await SecureStore.deleteItemAsync('smartpark_user_profile');
    } catch (e) {}
    set({ user: null, token: null, vehicles: [] });
  },

  fetchVehicles: async () => {
    try {
      const res = await api.get('/vehicles');
      set({ vehicles: res.data.vehicles || [] });
    } catch (err) {
      console.warn('Error fetching vehicles', err);
    }
  },

  addVehicle: async (data) => {
    const res = await api.post('/vehicles', data);
    await get().fetchVehicles();
  },

  deleteVehicle: async (id: string) => {
    await api.delete(`/vehicles/${id}`);
    await get().fetchVehicles();
  },
}));
