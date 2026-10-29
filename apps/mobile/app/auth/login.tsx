import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('driver@smartpark.ai');
  const [password, setPassword] = useState('Driver@123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.back();
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || 'Login failed';
      Alert.alert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Brand Banner with Official Logo */}
        <View style={styles.brandBox}>
          <Image
            source={require('../../assets/smartpark-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>SmartPark AI</Text>
          <Text style={styles.brandSubtitle}>Driver &amp; Vehicle Portal</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="driver@smartpark.ai"
          />

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
          </TouchableOpacity>

          {/* Test Account Quick Button */}
          <TouchableOpacity
            style={styles.quickFillBtn}
            onPress={() => {
              setEmail('driver@smartpark.ai');
              setPassword('Driver@123456');
            }}
          >
            <Text style={styles.quickFillText}>Quick-Fill Driver Test Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeBtnText}>Continue as Guest Driver</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: Spacing.sm,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 4,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  loginBtn: {
    backgroundColor: Colors.action,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickFillBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  quickFillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.action,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
