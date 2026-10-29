import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { SavedLocationData, useParkingStore } from '../store/parkingStore';
import { openDirectionsToFacility } from '../services/navigation';

interface Props {
  savedLocation: SavedLocationData | null;
  onSaveNew?: () => void;
}

export const FindMyVehicleCard: React.FC<Props> = ({ savedLocation, onSaveNew }) => {
  const clearLocation = useParkingStore((s) => s.clearSavedLocation);

  const handleNavigate = async () => {
    if (!savedLocation) return;
    const coords = savedLocation.gpsCoordinates || { latitude: 37.789172, longitude: -122.401449 };
    await openDirectionsToFacility(coords, savedLocation.facilityName);
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Parked Location',
      'Are you sure you want to remove your saved parking location?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => clearLocation() },
      ]
    );
  };

  if (!savedLocation) {
    return (
      <View style={[styles.card, styles.emptyCard]}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="car-outline" size={24} color={Colors.action} />
        </View>
        <Text style={styles.emptyTitle}>Find My Vehicle</Text>
        <Text style={styles.emptySubtitle}>
          Save your garage, floor, zone, and bay number to easily navigate back to your parked car.
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={onSaveNew} activeOpacity={0.8}>
          <Ionicons name="bookmark-outline" size={15} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Parking Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const parkedDate = new Date(savedLocation.parkedAt);
  const timeAgoMinutes = Math.max(1, Math.round((Date.now() - parkedDate.getTime()) / 60000));
  const timeAgoStr =
    timeAgoMinutes < 60 ? `${timeAgoMinutes}m ago` : `${Math.floor(timeAgoMinutes / 60)}h ${timeAgoMinutes % 60}m ago`;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.badgeRow}>
            <Ionicons name="navigate-circle" size={14} color={Colors.action} />
            <Text style={styles.badgeText}>SAVED VEHICLE LOCATION</Text>
          </View>
          <Text style={styles.facilityName} numberOfLines={1}>
            {savedLocation.facilityName}
          </Text>
        </View>

        <TouchableOpacity onPress={handleClear} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle-outline" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Grid: Floor, Zone, Bay */}
      <View style={styles.locationGrid}>
        <View style={styles.gridCell}>
          <Text style={styles.cellLabel}>LEVEL / FLOOR</Text>
          <Text style={styles.cellValue}>{savedLocation.floor}</Text>
        </View>
        <View style={styles.cellDivider} />
        <View style={styles.gridCell}>
          <Text style={styles.cellLabel}>ZONE</Text>
          <Text style={styles.cellValue}>{savedLocation.zone}</Text>
        </View>
        <View style={styles.cellDivider} />
        <View style={styles.gridCell}>
          <Text style={styles.cellLabel}>BAY / SPACE</Text>
          <Text style={[styles.cellValue, { color: Colors.action }]}>{savedLocation.bay}</Text>
        </View>
      </View>

      {/* Landmark Reference & Notes */}
      {savedLocation.pillarReference && (
        <View style={styles.landmarkRow}>
          <Ionicons name="flag-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.landmarkText}>{savedLocation.pillarReference}</Text>
        </View>
      )}

      {savedLocation.note && (
        <View style={styles.landmarkRow}>
          <Ionicons name="document-text-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.landmarkText}>{savedLocation.note}</Text>
        </View>
      )}

      {/* GPS Notice & Action Buttons */}
      <View style={styles.actionRow}>
        <View style={styles.timeTag}>
          <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.timeText}>Parked {timeAgoStr}</Text>
        </View>

        <TouchableOpacity style={styles.navigateBtn} onPress={handleNavigate} activeOpacity={0.8}>
          <Ionicons name="navigate" size={14} color="#FFFFFF" />
          <Text style={styles.navigateBtnText}>Directions to Garage</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimerText}>
        * GPS routes to garage entrance. Use stored floor ({savedLocation.floor}) &amp; bay ({savedLocation.bay}) once indoors.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.actionLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.action,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.action,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.action,
    letterSpacing: 0.6,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  clearBtn: {
    padding: 2,
  },
  locationGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  gridCell: {
    flex: 1,
    alignItems: 'center',
  },
  cellDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  cellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.xs,
  },
  landmarkText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.action,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  navigateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimerText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
