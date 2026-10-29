import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { useParkingStore } from '../store/parkingStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SaveLocationModal: React.FC<Props> = ({ visible, onClose }) => {
  const { facilities, selectedFacility, saveLocation, userLocation } = useParkingStore();

  const [facilityName, setFacilityName] = useState(
    selectedFacility ? selectedFacility.name : facilities[0]?.name || 'Tech Park Center Garage'
  );
  const [floor, setFloor] = useState('Level 2');
  const [zone, setZone] = useState('Zone B - Blue Pillars');
  const [bay, setBay] = useState('Bay 214');
  const [pillar, setPillar] = useState('Pillar B-14 near East Elevators');
  const [note, setNote] = useState('Parked near EV fast charger row');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const chosenFacility = facilities.find((f) => f.name === facilityName) || facilities[0];
    try {
      await saveLocation({
        facilityId: chosenFacility ? chosenFacility.id || (chosenFacility._id as string) : '6ae20866fc3e24cc616105ad',
        facilityName: chosenFacility?.name || facilityName,
        floor,
        zone,
        bay,
        pillarReference: pillar,
        note,
        gpsCoordinates: chosenFacility?.entranceCoordinates || userLocation || undefined,
        parkedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not save parked location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Save Parked Vehicle Location</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>GARAGE / FACILITY</Text>
            <View style={styles.facilityChips}>
              {facilities.slice(0, 4).map((f) => (
                <TouchableOpacity
                  key={f.id || f._id}
                  style={[styles.facilityChip, facilityName === f.name && styles.facilityChipActive]}
                  onPress={() => setFacilityName(f.name)}
                >
                  <Text
                    style={[
                      styles.facilityChipText,
                      facilityName === f.name && styles.facilityChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {f.name.replace(' Garage', '').replace(' Parking', '')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldCol, { marginRight: 8 }]}>
                <Text style={styles.label}>FLOOR / LEVEL</Text>
                <TextInput
                  style={styles.input}
                  value={floor}
                  onChangeText={setFloor}
                  placeholder="e.g. Level 2"
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={styles.label}>ZONE / DECK</Text>
                <TextInput
                  style={styles.input}
                  value={zone}
                  onChangeText={setZone}
                  placeholder="e.g. Zone B"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldCol, { marginRight: 8 }]}>
                <Text style={styles.label}>BAY NUMBER</Text>
                <TextInput
                  style={[styles.input, { fontWeight: '700', color: Colors.action }]}
                  value={bay}
                  onChangeText={setBay}
                  placeholder="e.g. Bay 214"
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={styles.label}>PILLAR / LANDMARK</Text>
                <TextInput
                  style={styles.input}
                  value={pillar}
                  onChangeText={setPillar}
                  placeholder="e.g. Pillar B-14"
                />
              </View>
            </View>

            <Text style={styles.label}>OPTIONAL NOTE</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="e.g. Near the elevators and charging bays"
            />

            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={15} color={Colors.action} />
              <Text style={styles.noticeText}>
                Entrance coordinates are stored automatically. GPS will route you to the entrance; your indoor bay details will guide you inside.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Vehicle Location'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 29, 66, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  formScroll: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  facilityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  facilityChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  facilityChipActive: {
    backgroundColor: Colors.action,
    borderColor: Colors.action,
  },
  facilityChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  facilityChipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldCol: {
    flex: 1,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.text,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.actionLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  noticeText: {
    fontSize: 11,
    color: Colors.actionDark,
    flex: 1,
    lineHeight: 15,
  },
  saveBtn: {
    backgroundColor: Colors.action,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
