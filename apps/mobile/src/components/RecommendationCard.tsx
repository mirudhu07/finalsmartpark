import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { openDirectionsToFacility } from '../services/navigation';

interface Props {
  recommendation: any | null;
  onReserve?: (facility: any) => void;
}

export const RecommendationCard: React.FC<Props> = ({ recommendation, onReserve }) => {
  if (!recommendation || !recommendation.facility) return null;

  const { facility, score, reason } = recommendation;

  const handleNavigate = async () => {
    await openDirectionsToFacility(facility.entranceCoordinates, facility.name);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.pill}>
          <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          <Text style={styles.pillText}>RECOMMENDED FOR YOU</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}/100 MATCH</Text>
        </View>
      </View>

      <Text style={styles.facilityName}>{facility.name}</Text>
      <Text style={styles.reasonText}>{reason}</Text>

      <View style={styles.specsRow}>
        <View style={styles.spec}>
          <Ionicons name="car-outline" size={14} color={Colors.action} />
          <Text style={styles.specText}>{facility.availableSpaces} open</Text>
        </View>
        <View style={styles.spec}>
          <Ionicons name="pricetag-outline" size={14} color={Colors.action} />
          <Text style={styles.specText}>${(facility.hourlyRateCents / 100).toFixed(2)}/hr</Text>
        </View>
        {facility.distanceKm !== null && (
          <View style={styles.spec}>
            <Ionicons name="navigate-outline" size={14} color={Colors.action} />
            <Text style={styles.specText}>{facility.distanceKm} km</Text>
          </View>
        )}
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.navBtn} onPress={handleNavigate} activeOpacity={0.8}>
          <Ionicons name="navigate" size={13} color={Colors.primary} />
          <Text style={styles.navBtnText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={() => onReserve && onReserve(facility)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={13} color="#FFFFFF" />
          <Text style={styles.reserveBtnText}>Reserve Space</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F2B5C', // Deep navy
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.action,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scoreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  scoreText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#93C5FD',
  },
  facilityName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginBottom: Spacing.md,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  reserveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.action,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  reserveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
