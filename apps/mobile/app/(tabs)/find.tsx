import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useParkingStore, ParkingFacility } from '../../src/store/parkingStore';
import { FacilityCard } from '../../src/components/FacilityCard';
import { ReservationModal } from '../../src/components/ReservationModal';

export default function FindParkingScreen() {
  const {
    facilities,
    searchQuery,
    filters,
    isLoading,
    setSearchQuery,
    setFilters,
    fetchFacilities,
  } = useParkingStore();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [reserveTarget, setReserveTarget] = useState<ParkingFacility | null>(null);

  // Filter Modal local state
  const [filterVehicle, setFilterVehicle] = useState<'car' | 'ev' | 'motorcycle' | undefined>(
    filters.vehicleType
  );
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | undefined>(filters.maxPrice);
  const [filterSort, setFilterSort] = useState(filters.sortBy || 'recommendation');

  const applyAdvancedFilters = () => {
    setFilters({
      vehicleType: filterVehicle,
      maxPrice: filterMaxPrice,
      sortBy: filterSort,
    });
    setShowFilterModal(false);
  };

  const clearAllFilters = () => {
    setFilterVehicle(undefined);
    setFilterMaxPrice(undefined);
    setFilterSort('recommendation');
    setFilters({
      vehicleType: undefined,
      maxPrice: undefined,
      amenities: undefined,
      sortBy: 'recommendation',
    });
    setShowFilterModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Search Bar Header */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search garage, campus, street, zone..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, filters.vehicleType || filters.maxPrice ? styles.filterBtnActive : null]}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={filters.vehicleType || filters.maxPrice ? '#FFFFFF' : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {/* Vehicle Filter Pills */}
          <TouchableOpacity
            style={[styles.chip, !filters.vehicleType && styles.chipActive]}
            onPress={() => setFilters({ vehicleType: undefined })}
          >
            <Text style={[styles.chipText, !filters.vehicleType && styles.chipTextActive]}>All Vehicles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filters.vehicleType === 'ev' && styles.chipActive]}
            onPress={() => setFilters({ vehicleType: filters.vehicleType === 'ev' ? undefined : 'ev' })}
          >
            <Ionicons
              name="flash"
              size={12}
              color={filters.vehicleType === 'ev' ? '#FFFFFF' : '#059669'}
            />
            <Text style={[styles.chipText, filters.vehicleType === 'ev' && styles.chipTextActive]}>
              EV Charging
            </Text>
          </TouchableOpacity>

          {/* Quick Sort Options */}
          <TouchableOpacity
            style={[styles.chip, filters.sortBy === 'nearest' && styles.chipActive]}
            onPress={() => setFilters({ sortBy: 'nearest' })}
          >
            <Ionicons
              name="navigate-outline"
              size={12}
              color={filters.sortBy === 'nearest' ? '#FFFFFF' : Colors.action}
            />
            <Text style={[styles.chipText, filters.sortBy === 'nearest' && styles.chipTextActive]}>
              Nearest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filters.sortBy === 'cheapest' && styles.chipActive]}
            onPress={() => setFilters({ sortBy: 'cheapest' })}
          >
            <Ionicons
              name="pricetag-outline"
              size={12}
              color={filters.sortBy === 'cheapest' ? '#FFFFFF' : Colors.textSecondary}
            />
            <Text style={[styles.chipText, filters.sortBy === 'cheapest' && styles.chipTextActive]}>
              Cheapest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, filters.sortBy === 'most_available' && styles.chipActive]}
            onPress={() => setFilters({ sortBy: 'most_available' })}
          >
            <Ionicons
              name="pie-chart-outline"
              size={12}
              color={filters.sortBy === 'most_available' ? '#FFFFFF' : Colors.textSecondary}
            />
            <Text style={[styles.chipText, filters.sortBy === 'most_available' && styles.chipTextActive]}>
              Most Available
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Facilities List */}
      <FlatList
        data={facilities}
        keyExtractor={(item) => item.id || item._id || item.name}
        renderItem={({ item }) => (
          <FacilityCard facility={item} onReserve={() => setReserveTarget(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Parking Facilities Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search keywords, increasing max distance, or clearing active filters.
            </Text>
            <TouchableOpacity style={styles.resetBtn} onPress={clearAllFilters}>
              <Text style={styles.resetBtnText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Advanced Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter &amp; Sort Garages</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort By */}
              <Text style={styles.filterGroupTitle}>SORT BY</Text>
              <View style={styles.sortGrid}>
                {[
                  { id: 'recommendation', label: 'Best Match (AI)' },
                  { id: 'nearest', label: 'Closest Distance' },
                  { id: 'cheapest', label: 'Lowest Rate' },
                  { id: 'most_available', label: 'Max Empty Bays' },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.sortBtn, filterSort === s.id && styles.sortBtnActive]}
                    onPress={() => setFilterSort(s.id as any)}
                  >
                    <Text style={[styles.sortBtnText, filterSort === s.id && styles.sortBtnTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Vehicle Compatibility */}
              <Text style={styles.filterGroupTitle}>VEHICLE TYPE</Text>
              <View style={styles.sortGrid}>
                {[
                  { id: undefined, label: 'All Types' },
                  { id: 'ev', label: 'EV (Charging bays)' },
                  { id: 'car', label: 'Standard Automobile' },
                  { id: 'motorcycle', label: 'Motorcycle' },
                ].map((v) => (
                  <TouchableOpacity
                    key={String(v.id)}
                    style={[styles.sortBtn, filterVehicle === v.id && styles.sortBtnActive]}
                    onPress={() => setFilterVehicle(v.id as any)}
                  >
                    <Text style={[styles.sortBtnText, filterVehicle === v.id && styles.sortBtnTextActive]}>
                      {v.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Max Hourly Tariff */}
              <Text style={styles.filterGroupTitle}>MAX HOURLY RATE</Text>
              <View style={styles.sortGrid}>
                {[
                  { val: undefined, label: 'Any Price' },
                  { val: 400, label: 'Under $4.00' },
                  { val: 500, label: 'Under $5.00' },
                  { val: 650, label: 'Under $6.50' },
                ].map((p) => (
                  <TouchableOpacity
                    key={String(p.val)}
                    style={[styles.sortBtn, filterMaxPrice === p.val && styles.sortBtnActive]}
                    onPress={() => setFilterMaxPrice(p.val)}
                  >
                    <Text style={[styles.sortBtnText, filterMaxPrice === p.val && styles.sortBtnTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearAllFilters}>
                <Text style={styles.clearBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyAdvancedFilters}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reservation Modal */}
      <ReservationModal
        visible={reserveTarget !== null}
        facility={reserveTarget}
        onClose={() => setReserveTarget(null)}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    gap: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 42,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  chipsBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  resetBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: Colors.action,
    borderRadius: BorderRadius.md,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 66, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  filterGroupTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortBtnTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.action,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
