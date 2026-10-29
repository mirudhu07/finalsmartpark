import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, vehicles, logout, addVehicle, deleteVehicle } = useAuthStore();

  const [notifications, setNotifications] = useState(true);
  const [evOnly, setEvOnly] = useState(user?.preferences?.evOnly ?? true);

  // Add vehicle modal
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vMake, setVMake] = useState('Tesla');
  const [vModel, setVModel] = useState('Model Y');
  const [vPlate, setVPlate] = useState('8EV-NEW');
  const [vColor, setVColor] = useState('Midnight Silver');
  const [vType, setVType] = useState<'car' | 'suv' | 'motorcycle' | 'ev' | 'van'>('ev');
  const [saving, setSaving] = useState(false);

  const handleCreateVehicle = async () => {
    setSaving(true);
    try {
      await addVehicle({
        make: vMake,
        model: vModel,
        licensePlate: vPlate.trim().toUpperCase(),
        color: vColor,
        type: vType,
        isDefault: false,
      });
      setShowAddVehicle(false);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to add vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, plate: string) => {
    Alert.alert('Remove Vehicle', `Remove ${plate} from your SmartPark garage?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteVehicle(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Driver Profile</Text>
        <Text style={styles.subtitle}>Account details, registered vehicles &amp; preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarLetter}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user ? user.name : 'Guest Driver'}</Text>
            <Text style={styles.userEmail}>{user ? user.email : 'driver@smartpark.ai'}</Text>
            <View style={styles.roleTag}>
              <Ionicons name="shield-checkmark" size={11} color={Colors.action} />
              <Text style={styles.roleText}>
                {user ? user.role.toUpperCase() : 'VERIFIED DRIVER'}
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicles Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MY REGISTERED VEHICLES ({vehicles.length})</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddVehicle(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color={Colors.action} />
            <Text style={styles.addBtnText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>

        {vehicles.length === 0 ? (
          <View style={styles.emptyVehicles}>
            <Text style={styles.emptyVehicleText}>No vehicles saved yet.</Text>
          </View>
        ) : (
          vehicles.map((v) => (
            <View key={v._id} style={styles.vehicleCard}>
              <View style={styles.vehicleIcon}>
                <Ionicons
                  name={v.type === 'ev' ? 'flash' : v.type === 'motorcycle' ? 'bicycle' : 'car'}
                  size={20}
                  color={v.type === 'ev' ? '#059669' : Colors.primary}
                />
              </View>
              <View style={styles.vehicleDetails}>
                <View style={styles.vehicleTitleRow}>
                  <Text style={styles.vehicleName}>
                    {v.make} {v.model}
                  </Text>
                  {v.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.plate}>{v.licensePlate} • {v.color}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(v._id, v.licensePlate)}
                style={styles.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={17} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Preferences Section */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>Parking Alerts &amp; Notifications</Text>
              <Text style={styles.prefSub}>Receive arrival reminders &amp; forecast surge alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#CBD5E1', true: Colors.action }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>Prioritize EV Charging</Text>
              <Text style={styles.prefSub}>Boost garages with fast EV charging stations</Text>
            </View>
            <Switch
              value={evOnly}
              onValueChange={setEvOnly}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>
        </View>

        {/* Brand Information with Official Logo */}
        <View style={styles.aboutCard}>
          <Image
            source={require('../../assets/smartpark-logo.png')}
            style={styles.aboutLogo}
            resizeMode="contain"
          />
          <Text style={styles.aboutTitle}>SmartPark AI Platform</Text>
          <Text style={styles.aboutVersion}>Production Release v1.4.0</Text>
          <Text style={styles.aboutSub}>
            Integrated with local machine-learning forecasting engine, turn-by-turn facility entrance navigation, and real-time occupancy synchronization.
          </Text>
        </View>

        {/* Log out / Switch User */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={17} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out of SmartPark</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Vehicle Modal */}
      <Modal visible={showAddVehicle} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Vehicle</Text>
              <TouchableOpacity onPress={() => setShowAddVehicle(false)}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <Text style={styles.inputLabel}>VEHICLE MAKE</Text>
              <TextInput style={styles.input} value={vMake} onChangeText={setVMake} placeholder="e.g. Tesla" />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.inputLabel}>MODEL</Text>
              <TextInput style={styles.input} value={vModel} onChangeText={setVModel} placeholder="e.g. Model Y" />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.inputLabel}>LICENSE PLATE</Text>
              <TextInput
                style={[styles.input, { fontWeight: '700' }]}
                value={vPlate}
                onChangeText={setVPlate}
                autoCapitalize="characters"
                placeholder="e.g. 8EV-NEW"
              />
            </View>

            <View style={styles.formRow}>
              <Text style={styles.inputLabel}>COLOR</Text>
              <TextInput style={styles.input} value={vColor} onChangeText={setVColor} placeholder="e.g. Blue" />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowAddVehicle(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={handleCreateVehicle}
                disabled={saving}
              >
                <Text style={styles.submitModalText}>{saving ? 'Saving...' : 'Add Vehicle'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
    marginBottom: Spacing.lg,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.actionLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.action,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.action,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.action,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs + 2,
  },
  vehicleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  defaultBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#059669',
  },
  plate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
    fontFamily: 'System',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyVehicles: {
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyVehicleText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  prefInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  prefLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  prefSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  aboutCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  aboutLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  aboutVersion: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.action,
    marginTop: 1,
  },
  aboutSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
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
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  formRow: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
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
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  cancelModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  submitModalBtn: {
    flex: 2,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: Colors.action,
    borderRadius: BorderRadius.md,
  },
  submitModalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
