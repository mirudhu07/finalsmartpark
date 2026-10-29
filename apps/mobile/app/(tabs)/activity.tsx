import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { api } from '../../src/services/api';

export default function ActivityScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data.sessions || []);
    } catch (e) {
      console.warn('Error fetching sessions', e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Parking Activity</Text>
        <Text style={styles.subtitle}>Recent sessions, entry receipts, and duration history</Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.action} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Parking Sessions Recorded</Text>
            <Text style={styles.emptySub}>
              When you enter a SmartPark enabled facility, your entry timestamp and fee receipt will display here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const entry = new Date(item.entryTime);
          const exit = item.exitTime ? new Date(item.exitTime) : null;
          const isOngoing = !exit;

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <div>
                  <Text style={styles.facilityName}>{item.facilityName}</Text>
                  <Text style={styles.plateText}>Vehicle: {item.vehiclePlate}</Text>
                </div>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: isOngoing ? '#EFF6FF' : '#ECFDF5' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: isOngoing ? Colors.action : Colors.success },
                    ]}
                  >
                    {isOngoing ? 'ACTIVE SESSION' : 'PAID & EXITED'}
                  </Text>
                </View>
              </View>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Text style={styles.timeLabel}>ENTRY TIME</Text>
                  <Text style={styles.timeVal}>
                    {entry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.dateVal}>
                    {entry.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </Text>
                </View>

                <Ionicons name="arrow-forward" size={14} color={Colors.textMuted} />

                <View style={[styles.timeItem, { alignItems: 'flex-end' }]}>
                  <Text style={styles.timeLabel}>EXIT TIME</Text>
                  <Text style={styles.timeVal}>
                    {exit
                      ? exit.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Parked Now'}
                  </Text>
                  <Text style={styles.dateVal}>
                    {exit ? exit.toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Ongoing'}
                  </Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.durationTag}>
                  <Ionicons name="hourglass-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.durationText}>
                    Duration: {item.durationMinutes ? `${item.durationMinutes} mins` : 'In Progress'}
                  </Text>
                </View>
                <Text style={styles.amountText}>
                  ${(item.amountDueCents / 100).toFixed(2)}
                </Text>
              </View>
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
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  plateText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  timeVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  dateVal: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    paddingHorizontal: Spacing.md,
  },
});
