import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { ParkingFacility, useParkingStore } from '../store/parkingStore';
import { useAuthStore } from '../store/authStore';

interface Props {
  visible: boolean;
  facility: ParkingFacility | null;
  onClose: () => void;
}

export const ReservationModal: React.FC<Props> = ({ visible, facility, onClose }) => {
  const { createReservation } = useParkingStore();
  const { user, vehicles } = useAuthStore();

  const [selectedDuration, setSelectedDuration] = useState<number>(2); // 2 hours
  const [selectedZone, setSelectedZone] = useState<string>('Standard Deck');
  const [plate, setPlate] = useState<string>(
    vehicles.find((v) => v.isDefault)?.licensePlate || '7EV-PARK'
  );
  const [loading, setLoading] = useState(false);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  if (!facility) return null;

  const hourlyRateCents = facility.hourlyRateCents || 450;
  const totalPriceCents = selectedDuration * hourlyRateCents;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const startTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // starts in 15 mins
      const endTime = new Date(Date.now() + (15 + selectedDuration * 60) * 60 * 1000).toISOString();

      const res = await createReservation({
        facilityId: facility.id || (facility._id as string),
        zoneName: selectedZone,
        vehiclePlate: plate.trim().toUpperCase(),
        startTime,
        endTime,
      });

      setCreatedRef(res.reservation.bookingReference);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Could not complete reservation';
      Alert.alert('Reservation Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setCreatedRef(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {createdRef ? (
            /* Success confirmation */
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>Reservation Confirmed!</Text>
              <Text style={styles.successSub}>
                Your parking bay is reserved at {facility.name}.
              </Text>

              <View style={styles.refCard}>
                <Text style={styles.refLabel}>UNIQUE BOOKING REFERENCE</Text>
                <Text style={styles.refCode}>{createdRef}</Text>
                <Text style={styles.refSub}>Show this code or QR at the garage barrier</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vehicle Plate:</Text>
                <Text style={styles.detailVal}>{plate.toUpperCase()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailVal}>{selectedDuration} Hours</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Charged:</Text>
                <Text style={[styles.detailVal, { color: Colors.action }]}>
                  ${(totalPriceCents / 100).toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity style={styles.doneBtn} onPress={handleFinish}>
                <Text style={styles.doneBtnText}>View in My Bookings</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Booking Form */
            <>
              <View style={styles.header}>
                <div>
                  <Text style={styles.headerTitle}>Reserve Parking Space</Text>
                  <Text style={styles.facilitySubtitle}>{facility.name}</Text>
                </div>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Duration Picker */}
                <Text style={styles.label}>SELECT DURATION</Text>
                <View style={styles.durationGrid}>
                  {[1, 2, 3, 4, 8].map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      style={[
                        styles.durationBtn,
                        selectedDuration === hours && styles.durationBtnActive,
                      ]}
                      onPress={() => setSelectedDuration(hours)}
                    >
                      <Text
                        style={[
                          styles.durationBtnText,
                          selectedDuration === hours && styles.durationBtnTextActive,
                        ]}
                      >
                        {hours}h
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Zone Picker */}
                <Text style={styles.label}>ZONE / DECK</Text>
                <View style={styles.zoneRow}>
                  {['Standard Deck', 'EV Charging Row', 'Covered VIP'].map((z) => (
                    <TouchableOpacity
                      key={z}
                      style={[styles.zoneChip, selectedZone === z && styles.zoneChipActive]}
                      onPress={() => setSelectedZone(z)}
                    >
                      <Text
                        style={[styles.zoneText, selectedZone === z && styles.zoneTextActive]}
                      >
                        {z}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Vehicle License Plate */}
                <Text style={styles.label}>VEHICLE LICENSE PLATE</Text>
                <TextInput
                  style={styles.input}
                  value={plate}
                  onChangeText={setPlate}
                  placeholder="e.g. 7EV-PARK"
                  autoCapitalize="characters"
                />

                {/* Price Breakdown */}
                <View style={styles.priceBreakdown}>
                  <View style={styles.priceLine}>
                    <Text style={styles.priceLabel}>Hourly Tariff</Text>
                    <Text style={styles.priceVal}>${(hourlyRateCents / 100).toFixed(2)} / hr</Text>
                  </View>
                  <View style={styles.priceLine}>
                    <Text style={styles.priceLabel}>Selected Duration</Text>
                    <Text style={styles.priceVal}>{selectedDuration} Hours</Text>
                  </View>
                  <View style={styles.priceDivider} />
                  <View style={styles.priceLine}>
                    <Text style={styles.totalLabel}>Total Estimated Cost</Text>
                    <Text style={styles.totalVal}>${(totalPriceCents / 100).toFixed(2)}</Text>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>
                  {loading ? 'Confirming Availability...' : `Confirm & Reserve ($${(totalPriceCents / 100).toFixed(2)})`}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 66, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  facilitySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  durationBtnActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  durationBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  durationBtnTextActive: {
    color: '#FFFFFF',
  },
  zoneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  zoneChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  zoneChipActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  zoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  zoneTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceBreakdown: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  priceLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  priceVal: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.action,
  },
  confirmBtn: {
    backgroundColor: Colors.action,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  successIconCircle: {
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  successSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  refCard: {
    width: '100%',
    backgroundColor: Colors.actionLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: Spacing.md,
  },
  refLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.actionDark,
    letterSpacing: 0.6,
  },
  refCode: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.action,
    letterSpacing: 1.5,
    fontFamily: 'System',
    marginVertical: 4,
  },
  refSub: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
