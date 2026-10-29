import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { useParkingStore } from '../src/store/parkingStore';

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const initStore = useParkingStore((s) => s.initStore);

  useEffect(() => {
    restoreSession();
    initStore();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="auth/login"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
