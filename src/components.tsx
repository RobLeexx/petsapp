import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, ReactNode, useEffect } from 'react';
import {
  AccessibilityRole,
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  cancelAnimation,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, roundedFont, shadow, spacing } from './theme';
import { ChildProfile } from './types';
import { prepareWeeklyChart, progressPercent } from './utils';

const petSheet = require('../assets/pets/pet-sheet.png');
const accessorySheet = require('../assets/accessories/accessory-sheet.png');

export function Screen({ children, contentStyle }: PropsWithChildren<{ contentStyle?: StyleProp<ViewStyle> }>) {
  const opacity = useSharedValue(0);
  const offset = useSharedValue(12);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350 });
    offset.value = withTiming(0, { duration: 350 });
  }, [offset, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: offset.value }] }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.screen, contentStyle]} keyboardShouldPersistTaps="handled">
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

type PressableScaleProps = PropsWithChildren<{
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  disabled?: boolean;
}>;

export function PressableScale({ children, onPress, style, accessibilityLabel, accessibilityRole = 'button', disabled }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function SpriteImage({ kind, index, size, label }: { kind: 'pet' | 'accessory'; index: number; size: number; label: string }) {
  const columns = kind === 'pet' ? 3 : 4;
  const rows = kind === 'pet' ? 2 : 3;
  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Image
        source={kind === 'pet' ? petSheet : accessorySheet}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: size * columns,
          height: size * rows,
          transform: [
            { translateX: -(index % columns) * size },
            { translateY: -Math.floor(index / columns) * size },
          ],
        }}
      />
    </View>
  );
}

export function FloatingPet({ index, size = 230, label }: { index: number; size?: number; label: string }) {
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withRepeat(withSequence(withTiming(-7, { duration: 1700 }), withTiming(0, { duration: 1700 })), -1);
    return () => cancelAnimation(translateY);
  }, [translateY]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  return <Animated.View style={animatedStyle}><SpriteImage kind="pet" index={index} size={size} label={label} /></Animated.View>;
}

export function AnimatedProgressBar({ value, color = colors.teal, height = 14 }: { value: number; color?: string; height?: number }) {
  const progress = useSharedValue(0);
  const clamped = Math.min(100, Math.max(0, value));
  useEffect(() => {
    progress.value = withDelay(180, withTiming(clamped, { duration: 750 }));
  }, [clamped, progress]);
  const animatedStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  return (
    <View style={[styles.progressTrack, { height }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}>
      <Animated.View style={[styles.progressFill, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{title}</Text>{action}</View>;
}

export function Pill({ icon, text, color = colors.blue }: { icon: keyof typeof Ionicons.glyphMap; text: string; color?: string }) {
  return <View style={[styles.pill, { backgroundColor: color }]}><Ionicons name={icon} size={17} color={colors.brown} /><Text style={styles.pillText}>{text}</Text></View>;
}

export function PrimaryButton({ label, onPress, icon = 'arrow-forward' }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <PressableScale onPress={onPress} style={styles.primaryButton} accessibilityLabel={label}>
      <LinearGradient colors={[colors.teal, colors.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
        <Text style={styles.primaryText}>{label}</Text><Ionicons name={icon} color={colors.white} size={20} />
      </LinearGradient>
    </PressableScale>
  );
}

export function ProfileSwitcher({ onPress }: { onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Cambiar perfil" style={styles.switcher}><Ionicons name="people-outline" size={16} color={colors.tealDark} /><Text style={styles.switcherText}>Cambiar perfil</Text></Pressable>;
}

export function WeeklyChart({ profile }: { profile: ChildProfile }) {
  const data = prepareWeeklyChart(profile);
  return (
    <View style={styles.chart} accessibilityLabel={`Actividad semanal de ${profile.nickname}`}>
      {data.map((day) => (
        <View key={day.label} style={styles.chartColumn}>
          <Text style={styles.chartValue}>{day.steps >= 1000 ? `${(day.steps / 1000).toFixed(1)}k` : day.steps}</Text>
          <View style={styles.chartTrack}><WeeklyBar percent={Math.max(day.percent, day.steps ? 8 : 2)} /></View>
          <Text style={styles.chartLabel}>{day.label}</Text>
        </View>
      ))}
    </View>
  );
}

function WeeklyBar({ percent }: { percent: number }) {
  const height = useSharedValue(2);
  useEffect(() => { height.value = withTiming(percent, { duration: 550 }); }, [height, percent]);
  const animatedStyle = useAnimatedStyle(() => ({ height: `${height.value}%` }));
  return <Animated.View style={[styles.chartBar, animatedStyle]} />;
}

export function ProfileSummary({ profile, onPress }: { profile: ChildProfile; onPress?: () => void }) {
  const content = (
    <View style={styles.profileSummary}>
      <View style={styles.avatar}>{profile.activePetId
        ? <SpriteImage kind="pet" index={({ fox: 0, corgi: 1, cat: 2, bunny: 3, panda: 4, hamster: 5 }[profile.activePetId] ?? 0)} size={64} label="Mascota" />
        : <Ionicons name="paw-outline" size={29} color={colors.teal} />}
      </View>
      <View style={styles.profileCopy}>
        <Text style={styles.profileName}>{profile.nickname}</Text>
        <Text style={styles.profileMeta}>Nivel {profile.level} · {profile.stepsToday.toLocaleString('es-ES')} pasos</Text>
        <AnimatedProgressBar value={progressPercent(profile.stepsToday, profile.dailyStepGoal)} height={8} />
      </View>
      {onPress && <Ionicons name="chevron-forward" size={22} color={colors.teal} />}
    </View>
  );
  return onPress ? <PressableScale onPress={onPress} style={styles.profileSummaryWrap}>{content}</PressableScale> : content;
}

export const typography = StyleSheet.create({
  eyebrow: { color: colors.tealDark, fontSize: 13, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { color: colors.brown, fontSize: 30, lineHeight: 36, ...roundedFont },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 23, fontWeight: '500' },
  cardTitle: { color: colors.brown, fontSize: 18, lineHeight: 23, ...roundedFont },
  body: { color: colors.muted, fontSize: 14, lineHeight: 20, fontWeight: '500' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  screen: { paddingHorizontal: 20, paddingTop: spacing.sm, paddingBottom: spacing.xxl, flexGrow: 1 },
  pressable: { flex: 1 },
  progressTrack: { width: '100%', borderRadius: radius.pill, backgroundColor: '#EAE3DA', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.pill },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { color: colors.brown, fontSize: 20, ...roundedFont },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  pillText: { color: colors.brown, fontSize: 13, fontWeight: '800' },
  primaryButton: { minHeight: 54, borderRadius: radius.pill, overflow: 'hidden', ...shadow },
  primaryGradient: { flex: 1, minHeight: 54, paddingHorizontal: 22, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  switcher: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8 },
  switcherText: { color: colors.tealDark, fontWeight: '800', fontSize: 13 },
  chart: { height: 180, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 7, paddingTop: 10 },
  chartColumn: { flex: 1, height: '100%', alignItems: 'center' },
  chartTrack: { flex: 1, width: '72%', backgroundColor: colors.blue, borderRadius: radius.pill, overflow: 'hidden', justifyContent: 'flex-end' },
  chartBar: { width: '100%', backgroundColor: colors.teal, borderRadius: radius.pill, minHeight: 2 },
  chartValue: { color: colors.muted, fontSize: 9, fontWeight: '700', marginBottom: 4 },
  chartLabel: { color: colors.brown, fontSize: 12, fontWeight: '800', marginTop: 6 },
  profileSummaryWrap: { backgroundColor: colors.white, borderRadius: radius.md, marginBottom: spacing.sm, ...shadow },
  profileSummary: { minHeight: 90, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  avatar: { width: 64, height: 64, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1, gap: 5 },
  profileName: { color: colors.brown, fontSize: 16, ...roundedFont },
  profileMeta: { color: colors.muted, fontSize: 12, fontWeight: '600' },
});
