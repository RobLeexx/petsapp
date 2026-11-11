import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedProgressBar, ProfileSummary, ProfileSwitcher, Screen, SectionHeading, SpriteImage, WeeklyChart, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { pets } from '@/data';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';
import { progressPercent } from '@/utils';

export default function FamilyDashboardScreen() {
  const { currentProfile, children } = useApp();
  const [selectedId, setSelectedId] = useState('kid_progress');
  if (currentProfile?.role !== 'parent') return null;
  const selected = children.find((child) => child.id === selectedId) ?? children[0];
  const pet = pets.find((item) => item.id === selected.activePetId);

  return (
    <Screen>
      <View style={styles.header}><View><Text style={typography.eyebrow}>Panel familiar</Text><Text style={typography.title}>Hola, {currentProfile.displayName}</Text></View><ProfileSwitcher onPress={() => router.replace('/')} /></View>
      <LinearGradient colors={['#CDEDEA', '#EAF7F5']} style={styles.banner}>
        <View style={styles.bannerCopy}><Text style={styles.bannerTitle}>Una familia en movimiento</Text><Text style={styles.bannerText}>Aquí puedes revisar la actividad simulada de tus peques de un vistazo.</Text><View style={styles.demoBadge}><Ionicons name="information-circle" size={15} color={colors.tealDark} /><Text style={styles.demoText}>Datos de demostración</Text></View></View>
        <View style={styles.bannerPets}><View style={styles.miniPet}><SpriteImage kind="pet" index={0} size={92} label="Zorro" /></View><View style={[styles.miniPet, styles.miniPetBack]}><SpriteImage kind="pet" index={4} size={78} label="Panda" /></View></View>
      </LinearGradient>

      <SectionHeading title="Tus peques" />
      {children.map((child) => <ProfileSummary key={child.id} profile={child} onPress={() => setSelectedId(child.id)} />)}

      <View style={styles.detailCard}>
        <View style={styles.detailHeader}><View><Text style={styles.selectedName}>{selected.nickname}</Text><Text style={typography.body}>{pet ? `${pet.name} · ${selected.evolutionStage ?? 'Cría'}` : 'Aún no ha elegido mascota'}</Text></View><View style={styles.level}><Text style={styles.levelText}>Nvl. {selected.level}</Text></View></View>
        <View style={styles.goalRow}><Text style={styles.goalLabel}>Meta diaria</Text><Text style={styles.goalValue}>{selected.stepsToday.toLocaleString('es-ES')} / {selected.dailyStepGoal.toLocaleString('es-ES')} pasos</Text></View>
        <AnimatedProgressBar value={progressPercent(selected.stepsToday, selected.dailyStepGoal)} />
        <SectionHeading title="Actividad semanal" />
        <WeeklyChart profile={selected} />
        <Text style={styles.activityTotal}>{selected.totalActivityMinutes ?? 0} minutos de actividad acumulada · {selected.dailyAwardedPoints ?? 0} puntos hoy</Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}><Ionicons name="flag" size={24} color={colors.coral} /><Text style={styles.metricValue}>{selected.completedChallenges}</Text><Text style={styles.metricLabel}>retos totales</Text></View>
        <View style={styles.metric}><Ionicons name="flame" size={24} color={colors.yellow} /><Text style={styles.metricValue}>{selected.streakDays}</Text><Text style={styles.metricLabel}>días de racha</Text></View>
        <View style={styles.metric}><Ionicons name="footsteps" size={24} color={colors.teal} /><Text style={styles.metricValue}>{selected.totalSteps >= 1000 ? `${(selected.totalSteps / 1000).toFixed(1)}k` : selected.totalSteps}</Text><Text style={styles.metricLabel}>pasos totales</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  banner: { minHeight: 188, marginTop: spacing.md, borderRadius: radius.lg, padding: spacing.lg, overflow: 'hidden', flexDirection: 'row', ...shadow },
  bannerCopy: { flex: 1, zIndex: 2 },
  bannerTitle: { color: colors.brown, fontSize: 23, lineHeight: 28, ...roundedFont },
  bannerText: { color: colors.muted, fontSize: 13, lineHeight: 18, fontWeight: '600', marginTop: 7 },
  demoBadge: { flexDirection: 'row', gap: 5, alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 6, marginTop: 13 },
  demoText: { color: colors.tealDark, fontSize: 10, fontWeight: '800' },
  bannerPets: { width: 105, justifyContent: 'center' },
  miniPet: { width: 92, height: 92, overflow: 'hidden', borderRadius: 28, zIndex: 2 },
  miniPetBack: { position: 'absolute', width: 78, height: 78, right: -20, bottom: 3, zIndex: 1, opacity: 0.88 },
  detailCard: { marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, ...shadow },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedName: { color: colors.brown, fontSize: 20, ...roundedFont },
  level: { backgroundColor: '#FFF0C9', borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  levelText: { color: colors.brown, fontWeight: '900' },
  goalRow: { marginTop: spacing.lg, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  goalLabel: { color: colors.brown, fontWeight: '800' },
  goalValue: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  metrics: { flexDirection: 'row', gap: 9, marginTop: spacing.md },
  activityTotal: { color: colors.muted, fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: spacing.sm },
  metric: { flex: 1, minHeight: 110, backgroundColor: colors.white, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', ...shadow },
  metricValue: { color: colors.brown, fontSize: 19, marginTop: 4, ...roundedFont },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', textAlign: 'center' },
});
