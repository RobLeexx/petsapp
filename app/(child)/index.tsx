import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import {
  AnimatedProgressBar,
  FloatingPet,
  Pill,
  PressableScale,
  ProfileSwitcher,
  Screen,
  SectionHeading,
  typography,
} from '@/components';
import { useApp } from '@/context/AppContext';
import { pets } from '@/data';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';
import { progressPercent } from '@/utils';

export default function ChildHomeScreen() {
  const { currentProfile } = useApp();
  const achievementOpacity = useSharedValue(0);
  const achievementScale = useSharedValue(0.92);
  useEffect(() => {
    achievementOpacity.value = withDelay(300, withTiming(1));
    achievementScale.value = withDelay(300, withSpring(1));
  }, [achievementOpacity, achievementScale]);
  const achievementStyle = useAnimatedStyle(() => ({ opacity: achievementOpacity.value, transform: [{ scale: achievementScale.value }] }));
  if (currentProfile?.role !== 'child') return null;

  const pet = pets.find((item) => item.id === currentProfile.activePetId) ?? pets[0];
  const stepProgress = progressPercent(currentProfile.stepsToday, currentProfile.dailyStepGoal);
  const xpProgress = currentProfile.xp % 1000 / 10;
  const complete = currentProfile.completedChallengesToday;

  return (
    <Screen>
      <View style={styles.header}>
        <View><Text style={typography.eyebrow}>¡Hola, {currentProfile.nickname}!</Text><Text style={styles.greeting}>{currentProfile.isNewUser ? '¡Tu aventura comienza hoy!' : '¡Tu racha sigue creciendo!'}</Text></View>
        <ProfileSwitcher onPress={() => router.replace('/')} />
      </View>

      <LinearGradient colors={[pet.color, '#FFFFFF']} style={styles.petHero}>
        <View style={styles.heroTop}><Pill icon="sparkles" text={`Nivel ${currentProfile.level}`} color="rgba(255,255,255,0.82)" /><Pill icon="leaf" text={currentProfile.evolutionStage ?? pet.stage} color="rgba(255,255,255,0.82)" /></View>
        <View style={styles.petCenter}><FloatingPet index={pet.spriteIndex} label={pet.name} /></View>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petMessage}>{currentProfile.stepsToday ? '¡Cada paso nos acerca a la próxima sorpresa!' : '¿Damos juntos nuestro primer paseo?'}</Text>
      </LinearGradient>

      <Animated.View style={[styles.statsRow, achievementStyle]}>
        <View style={[styles.stat, { backgroundColor: colors.blue }]}><Ionicons name="footsteps" size={24} color={colors.tealDark} /><Text style={styles.statValue}>{currentProfile.stepsToday.toLocaleString('es-ES')}</Text><Text style={styles.statLabel}>pasos hoy</Text></View>
        <View style={[styles.stat, { backgroundColor: '#FFF0C9' }]}><Ionicons name="flame" size={24} color={colors.coral} /><Text style={styles.statValue}>{currentProfile.streakDays}</Text><Text style={styles.statLabel}>días de racha</Text></View>
        <View style={[styles.stat, { backgroundColor: colors.pink }]}><Ionicons name="trophy" size={24} color={colors.coral} /><Text style={styles.statValue}>{currentProfile.completedChallenges}</Text><Text style={styles.statLabel}>retos logrados</Text></View>
      </Animated.View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}><View><Text style={styles.progressTitle}>Meta de pasos</Text><Text style={styles.progressCopy}>{currentProfile.stepsToday.toLocaleString('es-ES')} de {currentProfile.dailyStepGoal.toLocaleString('es-ES')}</Text></View><Text style={styles.progressPercent}>{Math.round(stepProgress)}%</Text></View>
        <AnimatedProgressBar value={stepProgress} />
        <View style={styles.xpHeader}><Text style={styles.xpLabel}>Experiencia del nivel</Text><Text style={styles.xpValue}>{currentProfile.xp} / 1.000 XP</Text></View>
        <AnimatedProgressBar value={xpProgress} color={colors.yellow} height={9} />
      </View>

      <SectionHeading title="Siguiente premio" />
      <View style={styles.milestone}>
        <View style={styles.gift}><Ionicons name="gift" size={30} color={colors.coral} /></View>
        <View style={styles.milestoneCopy}><Text style={styles.milestoneTitle}>{currentProfile.isNewUser ? 'Pañuelo aventurero' : 'Gafas de sol'}</Text><Text style={typography.body}>{currentProfile.isNewUser ? 'Completa tu primer reto para desbloquearlo.' : 'A 1.548 pasos de una nueva recompensa.'}</Text></View>
        <Ionicons name="lock-closed" size={20} color={colors.muted} />
      </View>

      <SectionHeading title="Retos de hoy" action={<Text style={styles.challengeCount}>{complete} / {currentProfile.dailyChallengesGoal}</Text>} />
      <PressableScale onPress={() => router.push('/(child)/challenges')} style={styles.challengeCard} accessibilityLabel="Ver retos de hoy">
        <View style={styles.challengeIcon}><Ionicons name={complete === 3 ? 'checkmark-circle' : 'flag'} size={32} color={complete === 3 ? colors.green : colors.coral} /></View>
        <View style={styles.challengeCopy}><Text style={styles.challengeTitle}>{complete === 3 ? '¡Retos diarios completados!' : 'Tres aventuras te esperan'}</Text><Text style={typography.body}>{complete === 3 ? 'Mia ha conseguido todos los retos de hoy.' : 'Empieza con un paseo matutino muy fácil.'}</Text></View>
        <Ionicons name="arrow-forward-circle" size={28} color={colors.teal} />
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 6, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  greeting: { color: colors.brown, fontSize: 20, marginTop: 3, ...roundedFont },
  petHero: { marginTop: spacing.md, borderRadius: radius.lg, minHeight: 355, padding: spacing.md, alignItems: 'center', overflow: 'hidden', ...shadow },
  heroTop: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  petCenter: { height: 220, justifyContent: 'center' },
  petName: { color: colors.brown, fontSize: 25, ...roundedFont },
  petMessage: { color: colors.muted, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 9, marginTop: spacing.md },
  stat: { flex: 1, minHeight: 112, padding: 10, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: colors.brown, fontSize: 20, marginTop: 5, ...roundedFont },
  statLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  progressCard: { marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, ...shadow },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  progressTitle: { color: colors.brown, fontSize: 17, ...roundedFont },
  progressCopy: { color: colors.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  progressPercent: { color: colors.tealDark, fontSize: 20, ...roundedFont },
  xpHeader: { marginTop: spacing.md, marginBottom: 7, flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { color: colors.brown, fontSize: 12, fontWeight: '800' },
  xpValue: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  milestone: { backgroundColor: colors.white, borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow },
  gift: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
  milestoneCopy: { flex: 1 },
  milestoneTitle: { color: colors.brown, fontSize: 15, ...roundedFont },
  challengeCount: { color: colors.tealDark, backgroundColor: colors.blue, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, fontWeight: '900' },
  challengeCard: { minHeight: 104, backgroundColor: colors.white, borderRadius: radius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow },
  challengeIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  challengeCopy: { flex: 1 },
  challengeTitle: { color: colors.brown, fontSize: 15, ...roundedFont },
});
