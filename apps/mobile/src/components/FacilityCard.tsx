import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { ParkingFacility } from '../store/parkingStore';
import { openDirectionsToFacility } from '../services/navigation';

interface Props {
  facility: ParkingFacility;
  onSelect?: () => void;
  onReserve?: () => void;
}

export const FacilityCard: React.FC<Props> = ({ facility, onSelect, onReserve }) => {
  const occ = facility.occupancyPercentage || 0;
  const isHigh = occ > 80;
  const isMed = occ > 60;
  const occColor = isHigh ? Colors.danger : isMed ? Colors.warning : Colors.success;

  const handleNavigate = async () => {
    await openDirectionsToFacility(facility.entranceCoordinates, facility.name);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onSelect} activeOpacity={0.85}>
      {/* Title & Distance */}
      <View style={styles.topRow}>
        <View style={styles.titleInfo}>
          <Text style={styles.facilityName} numberOfLines={1}>
            {facility.name}
          </Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {facility.address}
          </Text>
        </View>

        {facility.distanceKm !== null && (
          <View style={styles.distBadge}>
            <Ionicons name="navigate-outline" size={12} color={Colors.action} />
            <Text style={styles.distText}>{facility.distanceKm} km</Text>
          </View>
        )}
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>AVAILABLE</Text>
          <Text style={[styles.metricVal, { color: Colors.action }]}>{facility.availableSpaces}</Text>
          <Text style={styles.metricSub}>of {facility.totalCapacity} bays</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>OCCUPANCY</Text>
          <Text style={[styles.metricVal, { color: occColor }]}>{occ}%</Text>
          <Text style={styles.metricSub}>{facility.status.toUpperCase()}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>HOURLY TARIFF</Text>
          <Text style={styles.metricVal}>${(facility.hourlyRateCents / 100).toFixed(2)}</Text>
          <Text style={styles.metricSub}>per hour</Text>
        </View>
      </View>

      {/* Occupancy Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${occ}%`, backgroundColor: occColor }]} />
      </View>

      {/* Amenities Chips */}
      <View style={styles.amenitiesRow}>
        {facility.amenities?.includes('ev_charging') && (
          <View style={styles.chip}>
            <Ionicons name="flash" size={11} color="#059669" />
            <Text style={styles.chipText}>EV Charging</Text>
          </View>
        )}
        {facility.amenities?.includes('covered') && (
          <View style={styles.chip}>
            <Ionicons name="shield-checkmark" size={11} color={Colors.action} />
            <Text style={styles.chipText}>Covered</Text>
          </View>
        )}
        {facility.amenities?.includes('cctv_security') && (
          <View style={styles.chip}>
            <Ionicons name="videocam" size={11} color="#475569" />
            <Text style={styles.chipText}>CCTV</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.navBtn} onPress={handleNavigate} activeOpacity={0.8}>
          <Ionicons name="navigate" size={13} color={Colors.action} />
          <Text style={styles.navBtnText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reserveBtn} onPress={onReserve} activeOpacity={0.8}>
          <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
          <Text style={styles.reserveBtnText}>Reserve Space</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    shadowRadius: 6,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.actionLight,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.full,
  },
  distText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.action,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricSub: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  progressBg: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.actionLight,
    paddingVertical: 8.5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.action,
  },
  reserveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.action,
    paddingVertical: 8.5,
    borderRadius: BorderRadius.md,
  },
  reserveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
