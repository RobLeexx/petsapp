import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, ProfileSwitcher, Screen, SectionHeading, WeeklyChart, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { pets } from '@/data';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';

export default function ChildrenOverviewScreen() {
  const { currentProfile, children } = useApp();
  const [selectedId, setSelectedId] = useState('kid_progress');
  if (currentProfile?.role !== 'parent') return null;
  const child = children.find((item) => item.id === selectedId) ?? children[0];
  const pet = pets.find((item) => item.id === child.activePetId);

  return (
    <Screen>
      <View style={styles.header}><View><Text style={typography.eyebrow}>Resumen individual</Text><Text style={typography.title}>Actividad</Text></View><ProfileSwitcher onPress={() => router.replace('/')} /></View>
      <Text style={[typography.subtitle, styles.intro]}>Selecciona un perfil para revisar su progreso local simulado.</Text>
      <View style={styles.selector}>
        {children.map((item) => <PressableScale key={item.id} onPress={() => setSelectedId(item.id)} style={[styles.chip, selectedId === item.id && styles.chipActive]}><Text style={[styles.chipText, selectedId === item.id && styles.chipTextActive]}>{item.nickname}</Text></PressableScale>)}
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}><Ionicons name={pet ? 'paw' : 'sparkles-outline'} size={31} color={colors.tealDark} /></View>
        <View style={styles.heroCopy}><Text style={styles.name}>{child.nickname}</Text><Text style={typography.body}>{pet ? pet.name : 'Pendiente de elegir su primera mascota'}</Text></View>
        <View style={styles.level}><Text style={styles.levelValue}>{child.level}</Text><Text style={styles.levelLabel}>nivel</Text></View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}><Text style={styles.metricValue}>{child.stepsToday.toLocaleString('es-ES')}</Text><Text style={styles.metricLabel}>Pasos hoy</Text></View>
        <View style={styles.metric}><Text style={styles.metricValue}>{child.completedChallengesToday}</Text><Text style={styles.metricLabel}>Retos hoy</Text></View>
        <View style={styles.metric}><Text style={styles.metricValue}>{child.streakDays}</Text><Text style={styles.metricLabel}>Racha</Text></View>
      </View>

      <View style={styles.chartCard}><SectionHeading title="Últimos 7 días" /><WeeklyChart profile={child} /></View>

      <SectionHeading title="Historial reciente" />
      <View style={styles.historyCard}>
        {child.activityHistory.length ? child.activityHistory.slice(-5).reverse().map((day) => (
          <View key={day.date} style={styles.historyRow}><View style={styles.calendar}><Ionicons name="calendar-outline" size={19} color={colors.tealDark} /></View><View style={styles.historyCopy}><Text style={styles.historyDate}>{new Date(`${day.date}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</Text><Text style={typography.body}>{day.challenges} retos completados</Text></View><Text style={styles.historySteps}>{day.steps.toLocaleString('es-ES')} pasos</Text></View>
        )) : <View style={styles.empty}><Ionicons name="leaf-outline" size={35} color={colors.teal} /><Text style={styles.emptyTitle}>La aventura acaba de empezar</Text><Text style={[typography.body, styles.emptyText]}>El historial aparecerá cuando haya actividad simulada.</Text></View>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  intro: { marginTop: spacing.sm },
  selector: { flexDirection: 'row', gap: 8, marginTop: spacing.lg },
  chip: { flex: 1, minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { color: colors.brown, fontSize: 12, fontWeight: '800' },
  chipTextActive: { color: colors.white },
  hero: { marginTop: spacing.md, backgroundColor: colors.blue, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIcon: { width: 58, height: 58, borderRadius: 19, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  name: { color: colors.brown, fontSize: 18, ...roundedFont },
  level: { alignItems: 'center' },
  levelValue: { color: colors.tealDark, fontSize: 24, ...roundedFont },
  levelLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  metrics: { flexDirection: 'row', gap: 9, marginTop: spacing.md },
  metric: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', ...shadow },
  metricValue: { color: colors.brown, fontSize: 19, ...roundedFont },
  metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 2 },
  chartCard: { marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, ...shadow },
  historyCard: { backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: spacing.md, ...shadow },
  historyRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  calendar: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  historyCopy: { flex: 1 },
  historyDate: { color: colors.brown, fontSize: 14, ...roundedFont },
  historySteps: { color: colors.tealDark, fontSize: 12, fontWeight: '800' },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyTitle: { color: colors.brown, fontSize: 17, marginTop: 8, ...roundedFont },
  emptyText: { textAlign: 'center', marginTop: 4 },
});
