import { Linking, Platform, Alert } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function openDirectionsToFacility(
  coordinates: Coordinates,
  facilityName: string,
  indoorNote?: string
): Promise<boolean> {
  const { latitude, longitude } = coordinates;

  if (!latitude || !longitude || (latitude === 0 && longitude === 0)) {
    Alert.alert(
      'Navigation Unavailable',
      'This facility does not have verified GPS entrance coordinates. Please contact the garage operator.'
    );
    return false;
  }

  const encodedName = encodeURIComponent(facilityName);
  const latLng = `${latitude},${longitude}`;

  let url = '';

  if (Platform.OS === 'ios') {
    // Apple Maps URL scheme
    url = `maps://?q=${encodedName}&daddr=${latLng}&dirflg=d`;
  } else if (Platform.OS === 'android') {
    // Android Geo intent
    url = `geo:0,0?q=${latLng}(${encodedName})`;
  } else {
    // Web or fallback
    url = `https://www.google.com/maps/dir/?api=1&destination=${latLng}&destination_place_id=${encodedName}`;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      return true;
    } else {
      // Fallback to universal web maps URL
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng}`;
      await Linking.openURL(webUrl);
      return true;
    }
  } catch (err) {
    console.error('[Navigation Error]', err);
    // Final fallback attempt
    try {
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
      await Linking.openURL(fallbackUrl);
      return true;
    } catch (e) {
      Alert.alert('Navigation Error', 'Could not open maps application on this device.');
      return false;
    }
  }
}
