import { describe, it, expect } from 'vitest';
import {
  isValidCoordinates,
  buildNavigationUrls,
  formatIndoorLocation,
} from '../services/navigationHelper';

describe('SmartPark AI Mobile Logic Tests', () => {
  it('isValidCoordinates should reject null, undefined, or [0, 0] coordinates', () => {
    expect(isValidCoordinates(null)).toBe(false);
    expect(isValidCoordinates(undefined)).toBe(false);
    expect(isValidCoordinates({ latitude: 0, longitude: 0 })).toBe(false);
    expect(isValidCoordinates({ latitude: 120, longitude: 50 })).toBe(false); // invalid latitude
  });

  it('isValidCoordinates should accept valid San Francisco entrance coordinates', () => {
    expect(isValidCoordinates({ latitude: 37.789172, longitude: -122.401449 })).toBe(true);
  });

  it('buildNavigationUrls should construct proper iOS, Android, and Web URL schemes', () => {
    const coords = { latitude: 37.789172, longitude: -122.401449 };
    const urls = buildNavigationUrls(coords, 'Tech Park Center Garage');

    expect(urls.iosUrl).toContain('maps://?q=Tech%20Park%20Center%20Garage&daddr=37.789172,-122.401449');
    expect(urls.androidUrl).toContain('geo:0,0?q=37.789172,-122.401449(Tech%20Park%20Center%20Garage)');
    expect(urls.webUrl).toContain('https://www.google.com/maps/dir/?api=1&destination=37.789172,-122.401449');
  });

  it('Sorting facilities by cheapest should sort by hourlyRateCents ascending', () => {
    const facilities = [
      { id: '1', name: 'Expensive', hourlyRateCents: 600, availableSpaces: 50 },
      { id: '2', name: 'Cheap', hourlyRateCents: 350, availableSpaces: 20 },
      { id: '3', name: 'Moderate', hourlyRateCents: 450, availableSpaces: 100 },
    ];

    const sorted = [...facilities].sort((a, b) => a.hourlyRateCents - b.hourlyRateCents);
    expect(sorted[0].name).toBe('Cheap');
    expect(sorted[1].name).toBe('Moderate');
    expect(sorted[2].name).toBe('Expensive');
  });

  it('Sorting facilities by most available should sort by availableSpaces descending', () => {
    const facilities = [
      { id: '1', name: 'Low', availableSpaces: 10 },
      { id: '2', name: 'High', availableSpaces: 350 },
      { id: '3', name: 'Medium', availableSpaces: 120 },
    ];

    const sorted = [...facilities].sort((a, b) => b.availableSpaces - a.availableSpaces);
    expect(sorted[0].name).toBe('High');
    expect(sorted[1].name).toBe('Medium');
    expect(sorted[2].name).toBe('Low');
  });

  it('Forecast calculation should preserve total capacity invariant', () => {
    const facilityCapacity = 500;
    const predictedOccupancyPct = 68; // 68%

    const predictedOccupied = Math.round((predictedOccupancyPct / 100) * facilityCapacity);
    const predictedAvailable = Math.max(0, facilityCapacity - predictedOccupied);

    expect(predictedOccupied).toBe(340);
    expect(predictedAvailable).toBe(160);
    expect(predictedOccupied + predictedAvailable).toBe(facilityCapacity);
  });

  it('Indoor location formatting should clearly distinguish floor, zone, and bay from GPS', () => {
    const formatted = formatIndoorLocation({
      facilityName: 'Tech Park Center Garage',
      floor: 'Level 2',
      zone: 'Zone B',
      bay: 'Bay 214',
      pillarReference: 'Pillar B-14',
    });

    expect(formatted).toBe('Tech Park Center Garage • Floor: Level 2 • Zone: Zone B • Bay: Bay 214 • (Pillar B-14)');
  });
});
