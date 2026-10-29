import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useParkingStore } from '../../src/store/parkingStore';

export default function BookingsScreen() {
  const router = useRouter();
  const { reservations, fetchReservations, cancelReservation } = useParkingStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  const handleCancel = (res: any) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel booking ${res.bookingReference}? A refund will be processed to your payment method.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelReservation(res._id);
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.error || 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const activeReservations = reservations.filter((r) => r.status === 'confirmed' || r.status === 'active');
  const pastReservations = reservations.filter((r) => r.status !== 'confirmed' && r.status !== 'active');

  const renderReservationCard = (item: any) => {
    const isConfirmed = item.status === 'confirmed';
    const isActive = item.status === 'active';
    const isCancelled = item.status === 'cancelled';

    return (
      <View key={item._id} style={styles.card}>
        <View style={styles.cardHeader}>
          <div>
            <Text style={styles.refLabel}>REFERENCE</Text>
            <Text style={styles.refCode}>{item.bookingReference}</Text>
          </div>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isConfirmed
                  ? '#ECFDF5'
                  : isActive
                  ? '#EFF6FF'
                  : isCancelled
                  ? '#FEF2F2'
                  : '#F1F5F9',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: isConfirmed
                    ? '#059669'
                    : isActive
                    ? Colors.action
                    : isCancelled
                    ? Colors.danger
                    : '#64748B',
                },
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.facilityName}>{item.facilityName}</Text>
        <Text style={styles.zoneText}>{item.zoneName || 'Standard Reserved Bay'}</Text>

        <View style={styles.timeBox}>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>START</Text>
            <Text style={styles.timeVal}>
              {new Date(item.startTime).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />
          <View style={[styles.timeCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.timeLabel}>END</Text>
            <Text style={styles.timeVal}>
              {new Date(item.endTime).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <Text style={styles.plateText}>Plate: {item.vehiclePlate}</Text>
            <Text style={styles.priceText}>${(item.totalPriceCents / 100).toFixed(2)}</Text>
          </View>

          {(isConfirmed || isActive) && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reservations</Text>
        <Text style={styles.subtitle}>Active parking passes and historical bookings</Text>
      </View>

      <FlatList
        data={[{ key: 'active' }, { key: 'past' }]}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.action} />
        }
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.key === 'active') {
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  ACTIVE BOOKINGS ({activeReservations.length})
                </Text>
                {activeReservations.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Ionicons name="calendar-outline" size={28} color={Colors.textMuted} />
                    <Text style={styles.emptyCardText}>No active bookings right now.</Text>
                    <TouchableOpacity
                      style={styles.findBtn}
                      onPress={() => router.push('/(tabs)/find')}
                    >
                      <Text style={styles.findBtnText}>Find &amp; Reserve Parking</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  activeReservations.map(renderReservationCard)
                )}
              </View>
            );
          }

          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                PAST RESERVATIONS ({pastReservations.length})
              </Text>
              {pastReservations.map(renderReservationCard)}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  refLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  refCode: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.action,
    fontFamily: 'System',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  zoneText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  timeCol: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  timeVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plateText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCardText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  findBtn: {
    backgroundColor: Colors.action,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  findBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
