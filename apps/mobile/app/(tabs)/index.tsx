import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useParkingStore, ParkingFacility } from '../../src/store/parkingStore';
import { useAuthStore } from '../../src/store/authStore';

// Components
import { ParkingSummaryCard } from '../../src/components/ParkingSummaryCard';
import { NextHourForecastCard } from '../../src/components/NextHourForecastCard';
import { RecommendationCard } from '../../src/components/RecommendationCard';
import { FindMyVehicleCard } from '../../src/components/FindMyVehicleCard';
import { SaveLocationModal } from '../../src/components/SaveLocationModal';
import { ReservationModal } from '../../src/components/ReservationModal';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    facilities,
    selectedFacility,
    forecast,
    recommendation,
    savedLocation,
    setSelectedFacility,
    fetchFacilities,
    fetchRecommendation,
    fetchSavedLocation,
  } = useParkingStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveTargetFacility, setReserveTargetFacility] = useState<ParkingFacility | null>(null);
  const [showFacilityPicker, setShowFacilityPicker] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFacilities(), fetchRecommendation(), fetchSavedLocation()]);
    setRefreshing(false);
  };

  const openReserve = (fac: ParkingFacility) => {
    setReserveTargetFacility(fac);
    setShowReserveModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Brand Header with Official Logo */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/smartpark-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View>
              <Text style={styles.appName}>SmartPark AI</Text>
              <Text style={styles.greetingText}>
                 Welcome back, {user ? user.name.split(' ')[0] : 'Driver'}
              </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.action} />
        }
      >
        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/find')}
            activeOpacity={0.75}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: Colors.actionLight }]}>
              <Ionicons name="search" size={20} color={Colors.action} />
            </View>
            <Text style={styles.quickActionLabel}>Find Parking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setShowSaveModal(true)}
            activeOpacity={0.75}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="car" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.quickActionLabel}>Parked Car</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/bookings')}
            activeOpacity={0.75}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="calendar" size={20} color="#059669" />
            </View>
            <Text style={styles.quickActionLabel}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/activity')}
            activeOpacity={0.75}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={20} color="#D97706" />
            </View>
            <Text style={styles.quickActionLabel}>Activity</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Current Parking Summary Card */}
        <ParkingSummaryCard
          facility={selectedFacility}
          onSelectFacility={() => setShowFacilityPicker(true)}
        />

        {/* 2. Dedicated Next-Hour ML Occupancy Forecast Card */}
        <NextHourForecastCard forecast={forecast} />

        {/* 3. Personalized Recommendation */}
        <RecommendationCard
          recommendation={recommendation}
          onReserve={(fac) => openReserve(fac)}
        />

        {/* 4. Find My Vehicle */}
        <FindMyVehicleCard
          savedLocation={savedLocation}
          onSaveNew={() => setShowSaveModal(true)}
        />
      </ScrollView>

      {/* Facility Switcher Modal */}
      <Modal visible={showFacilityPicker} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBox}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Switch Monitored Garage</Text>
              <TouchableOpacity onPress={() => setShowFacilityPicker(false)}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {facilities.map((f) => (
              <TouchableOpacity
                key={f.id || f._id}
                style={[
                  styles.pickerItem,
                  selectedFacility?.id === f.id && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setSelectedFacility(f);
                  setShowFacilityPicker(false);
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerItemName}>{f.name}</Text>
                  <Text style={styles.pickerItemSub}>
                    {f.availableSpaces} open • {f.occupancyPercentage}% occupied
                  </Text>
                </View>
                {selectedFacility?.id === f.id && (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.action} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Save Vehicle Location Modal */}
      <SaveLocationModal visible={showSaveModal} onClose={() => setShowSaveModal(false)} />

      {/* Reserve Space Modal */}
      <ReservationModal
        visible={showReserveModal}
        facility={reserveTargetFacility}
        onClose={() => {
          setShowReserveModal(false);
          setReserveTargetFacility(null);
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  greetingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  profileBtn: {
    padding: 2,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    width: '23%',
  },
  quickIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 66, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  pickerBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    marginVertical: 2,
  },
  pickerItemActive: {
    backgroundColor: Colors.actionLight,
  },
  pickerItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  pickerItemSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
