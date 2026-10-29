import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android Emulator uses 10.0.2.2 to access host machine localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api/v1';
  }
  // iOS Simulator and local web default
  return 'http://localhost:5001/api/v1';
};

const getSocketUrl = (): string => {
  if (process.env.EXPO_PUBLIC_SOCKET_URL) {
    return process.env.EXPO_PUBLIC_SOCKET_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001';
  }
  return 'http://localhost:5001';
};

export const Config = {
  apiUrl: getBaseUrl(),
  socketUrl: getSocketUrl(),
  defaultGps: {
    latitude: 37.789172,
    longitude: -122.401449,
  },
  timeoutMs: 10000,
};
