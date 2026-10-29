export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function isValidCoordinates(coords?: Coordinates | null): boolean {
  if (!coords) return false;
  const { latitude, longitude } = coords;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (isNaN(latitude) || isNaN(longitude)) return false;
  if (latitude === 0 && longitude === 0) return false;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false;
  return true;
}

export function buildNavigationUrls(
  coords: Coordinates,
  facilityName: string
): { iosUrl: string; androidUrl: string; webUrl: string } {
  const encodedName = encodeURIComponent(facilityName);
  const latLng = `${coords.latitude},${coords.longitude}`;

  return {
    iosUrl: `maps://?q=${encodedName}&daddr=${latLng}&dirflg=d`,
    androidUrl: `geo:0,0?q=${latLng}(${encodedName})`,
    webUrl: `https://www.google.com/maps/dir/?api=1&destination=${latLng}`,
  };
}

export function formatIndoorLocation(loc: {
  facilityName: string;
  floor: string;
  zone: string;
  bay: string;
  pillarReference?: string;
}): string {
  const parts = [`${loc.facilityName}`, `Floor: ${loc.floor}`, `Zone: ${loc.zone}`, `Bay: ${loc.bay}`];
  if (loc.pillarReference) {
    parts.push(`(${loc.pillarReference})`);
  }
  return parts.join(' • ');
}
