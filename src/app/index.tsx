import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchCaregivers, fetchMedicines } from '@/services/ontimehealth-api';
import { Caregiver, Medicine, UserRole } from '@/types/ontimehealth';

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [userRole, setUserRole] = useState<UserRole>('pasien');
  const [familyCode] = useState<string>('FAM-8821');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [medicineData, caregiverData] = await Promise.all([
        fetchMedicines(),
        fetchCaregivers(),
      ]);
      setMedicines(medicineData);
      setCaregiver(caregiverData[0] ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan yang tidak diketahui'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hitung Kepatuhan
  const takenCount = medicines.filter((m) => m.status === 'diminum').length;
  const compliancePercentage =
    medicines.length > 0
      ? Math.round((takenCount / medicines.length) * 100)
      : 0;

  const handleMarkAsTaken = (id: string) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, status: 'diminum' } : med))
    );
  };

  const insetsStyle = Platform.select({
    android: {
      paddingTop: Math.max(safeAreaInsets.top, Spacing.three),
      paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
    },
    ios: {
      paddingTop: Math.max(safeAreaInsets.top, Spacing.two),
      paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
    },
    web: {
      paddingTop: Spacing.four,
      paddingBottom: Spacing.six,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: '#F8FAFC' }]}
      contentContainerStyle={[styles.contentContainer, insetsStyle]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.mainWrapper}>
        
        {/* ==================== 1. HEADER ==================== */}
        <View style={styles.headerContainer}>
          <View>
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>ONTIME HEALTH</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Kode Keluarga: <Text style={styles.codeText}>{familyCode}</Text>
            </Text>
          </View>

          {/* Role Toggle & Quick Action */}
          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.roleSwitchBtn,
                pressed && styles.pressedOpacity,
              ]}
              onPress={() => setUserRole(userRole === 'pasien' ? 'pendamping' : 'pasien')}>
              <Text style={styles.roleSwitchText}>
                Mode: {userRole === 'pasien' ? '🏥 Pasien' : '🛡️ Pendamping'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ==================== 2. JUDUL & INFORMASI UTAMA ==================== */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {userRole === 'pasien'
              ? 'Bersama Menjaga Kesehatan & Rutinitas Obat'
              : 'Pantau Kesehatan & Kepatuhan Obat Pasien'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {userRole === 'pasien'
              ? 'Pengingat obat otomatis dengan sistem eskalasi pintar ke pendamping Anda.'
              : 'Terhubung langsung dengan Pasien (FAM-8821). Dapatkan notifikasi jika obat terlewat.'}
          </Text>
        </View>

        {/* ==================== 3. VISUAL HERO / BANNER ==================== */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>Status Kepatuhan Hari Ini</Text>
            </View>
            <Text style={styles.bannerScore}>{compliancePercentage}%</Text>
            <Text style={styles.bannerDetail}>
              {takenCount} dari {medicines.length} obat telah diminum tepat waktu
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${compliancePercentage}%` },
                ]}
              />
            </View>
          </View>

          <Image
            source={require('@/assets/images/react-logo.png')}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </View>

        {/* ==================== 4. BUTTON / ACTION BAR ==================== */}
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.primaryButtonText}>
              {userRole === 'pasien' ? '+ Tambah Obat Baru' : ' Hubungi Pasien'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressedOpacity,
            ]}>
            <Text style={styles.secondaryButtonText}>Lihat Program →</Text>
          </Pressable>
        </View>

        {/* ==================== 5. CONTENT SECTION 1: JADWAL OBAT ==================== */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>
            {userRole === 'pasien' ? 'Jadwal Obat Hari Ini' : 'Jadwal Obat Pasien'}
          </Text>
          <Text style={styles.sectionLink}>Lihat Semua</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0284C7"
            style={styles.loadingIndicator}
          />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.retryBtn,
                pressed && styles.pressedOpacity,
              ]}
              onPress={loadData}>
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.medicineList}>
            {medicines.map((med) => {
              const isTaken = med.status === 'diminum';
              return (
                <View key={med.id} style={styles.medicineCard}>
                  <View style={styles.medicineTimeBadge}>
                    <Text style={styles.medicineTimeText}>{med.time}</Text>
                    <Text style={styles.medicineCategoryText}>{med.category}</Text>
                  </View>

                  <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>{med.name}</Text>
                    <Text style={styles.medicineDosage}>📋 {med.dosage}</Text>
                    {med.notes && (
                      <Text style={styles.medicineNotes}>💡 {med.notes}</Text>
                    )}
                  </View>

                  <View style={styles.medicineActionContainer}>
                    {isTaken ? (
                      <View style={styles.statusDoneBadge}>
                        <Text style={styles.statusDoneText}>✓ Diminum</Text>
                      </View>
                    ) : (
                      <Pressable
                        style={({ pressed }) => [
                          styles.takeBtn,
                          pressed && styles.pressedOpacity,
                        ]}
                        onPress={() => handleMarkAsTaken(med.id)}>
                        <Text style={styles.takeBtnText}>
                          {userRole === 'pasien' ? 'Minum' : 'Ingatkan'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ==================== 6. CONTENT SECTION 2: PENDAMPING TERHUBUNG ==================== */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Pendamping Terhubung</Text>
        </View>

        {caregiver && (
          <View style={styles.caregiverCard}>
            <View style={styles.caregiverAvatar}>
              <Text style={styles.caregiverAvatarText}>👨‍⚕️</Text>
            </View>

            <View style={styles.caregiverDetails}>
              <Text style={styles.caregiverName}>{caregiver.name}</Text>
              <Text style={styles.caregiverSub}>
                Hubungan: {caregiver.relation} • {caregiver.phone}
              </Text>
              <View style={styles.onlineStatusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineStatusText}>Terhubung via Supabase Cloud</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.callButton,
                pressed && styles.pressedOpacity,
              ]}>
              <Text style={styles.callButtonText}>📞 Telepon</Text>
            </Pressable>
          </View>
        )}

        {/* ==================== 7. CONTENT SECTION 3: FEATURE GRID ==================== */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Layanan Utama Ontime Health</Text>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureTitle}>Pengingat Lokal</Text>
            <Text style={styles.featureDesc}>
              Alarm lokal expo-notifications tanpa butuh koneksi internet.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Eskalasi 30 Menit</Text>
            <Text style={styles.featureDesc}>
              Push notification otomatis ke pendamping via Supabase Edge Function jika obat terlewat.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Grafik Kepatuhan</Text>
            <Text style={styles.featureDesc}>
              Laporan kepatuhan mingguan dan riwayat minum obat lengkap.
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👨‍👩‍👧</Text>
            <Text style={styles.featureTitle}>Kode Keluarga</Text>
            <Text style={styles.featureDesc}>
              Hubungkan 1 Pasien ke beberapa Pendamping dengan 1 Kode Unik.
            </Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },

  /* HEADER STYLES */
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  brandBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  brandText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  codeText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  roleSwitchBtn: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  roleSwitchText: {
    color: '#0369A1',
    fontWeight: '700',
    fontSize: 13,
  },

  /* HERO SECTION */
  heroSection: {
    gap: Spacing.one,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },

  /* BANNER / VISUAL STYLES */
  bannerContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerContent: {
    flex: 1,
    gap: Spacing.two,
  },
  badgePill: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgePillText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 11,
  },
  bannerScore: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bannerDetail: {
    fontSize: 13,
    color: '#94A3B8',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4,
  },
  bannerImage: {
    width: 70,
    height: 70,
    opacity: 0.8,
  },

  /* ACTION ROW */
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 14,
  },

  /* SECTION HEADERS */
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionLink: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '600',
  },

  /* LOADING & ERROR STATE */
  loadingIndicator: {
    paddingVertical: Spacing.five,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* MEDICINE LIST */
  medicineList: {
    gap: Spacing.three,
  },
  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.three,
  },
  medicineTimeBadge: {
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
  },
  medicineTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
  medicineCategoryText: {
    fontSize: 10,
    color: '#0369A1',
    marginTop: 2,
  },
  medicineInfo: {
    flex: 1,
    gap: 2,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  medicineDosage: {
    fontSize: 13,
    color: '#475569',
  },
  medicineNotes: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  medicineActionContainer: {
    justifyContent: 'center',
  },
  takeBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  takeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statusDoneBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDoneText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 12,
  },

  /* CAREGIVER CARD */
  caregiverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: Spacing.three,
  },
  caregiverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caregiverAvatarText: {
    fontSize: 22,
  },
  caregiverDetails: {
    flex: 1,
    gap: 2,
  },
  caregiverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  caregiverSub: {
    fontSize: 12,
    color: '#64748B',
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  onlineStatusText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  /* FEATURE GRID */
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  featureDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },

  /* UTILITY STYLES */
  pressedOpacity: {
    opacity: 0.75,
  },
});
