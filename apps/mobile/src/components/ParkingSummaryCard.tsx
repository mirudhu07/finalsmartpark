import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { ParkingFacility } from '../store/parkingStore';

interface Props {
  facility: ParkingFacility | null;
  onSelectFacility?: () => void;
}

export const ParkingSummaryCard: React.FC<Props> = ({ facility, onSelectFacility }) => {
  if (!facility) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Loading Parking Summary...</Text>
      </View>
    );
  }

  const occupancy = facility.occupancyPercentage || 0;
  const isHigh = occupancy > 80;
  const isMed = occupancy > 60;
  const statusColor = isHigh ? Colors.danger : isMed ? Colors.warning : Colors.success;

  return (
    <View style={styles.card}>
      {/* Header with facility selector button */}
      <View style={styles.headerRow}>
        <View style={styles.facilityInfo}>
          <Text style={styles.caption}>CURRENT PARKING SUMMARY</Text>
          <TouchableOpacity onPress={onSelectFacility} style={styles.selectorButton} activeOpacity={0.7}>
            <Text style={styles.facilityName} numberOfLines={1}>
              {facility.name}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.action} />
          </TouchableOpacity>
        </View>

        {/* Live Status Badge */}
        <View style={styles.liveBadge}>
          <View style={styles.livePulse} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Main Metric Counter */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>AVAILABLE SPACES</Text>
          <Text style={[styles.statValue, { color: Colors.action }]}>{facility.availableSpaces}</Text>
          <Text style={styles.statSub}>of {facility.totalCapacity} total capacity</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>LOAD STATUS</Text>
          <Text style={[styles.statValue, { color: statusColor }]}>{occupancy}%</Text>
          <Text style={styles.statSub}>{facility.currentOccupancy} occupied</Text>
        </View>
      </View>

      {/* Occupancy Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${occupancy}%`, backgroundColor: statusColor }]} />
      </View>

      {/* Bottom Subtext */}
      <View style={styles.footerRow}>
        <View style={styles.amenityRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.addressText} numberOfLines={1}>
            {facility.address}
          </Text>
        </View>
        <Text style={styles.rateText}>${(facility.hourlyRateCents / 100).toFixed(2)}/hr</Text>
      </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  facilityInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  caption: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  facilityName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'System',
  },
  statSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: Spacing.sm,
  },
  addressText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
