import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useApp } from './context/AppContext';
import { accessories, pets } from './data';
import { PetStepsLoader } from './PetStepsLoader';
import { PrimaryButton, SpriteImage } from './components';
import { colors, radius, roundedFont, shadow, spacing } from './theme';

export function AnimatedSplash({ ready }: { ready: boolean }) {
  const [visible, setVisible] = useState(true);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const float = useSharedValue(0);
  const pulse = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => setMinimumElapsed(true), 1300);
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!reducedMotion) {
      float.value = withRepeat(withSequence(withTiming(-8, { duration: 1100 }), withTiming(8, { duration: 1100 })), -1, true);
      pulse.value = withRepeat(withSequence(withTiming(1.025, { duration: 1100 }), withTiming(1, { duration: 1100 })), -1, true);
    }
    return () => { cancelAnimation(float); cancelAnimation(pulse); };
  }, [float, pulse, reducedMotion]);

  useEffect(() => {
    if (!ready || !minimumElapsed) return;
    opacity.value = withTiming(0, { duration: reducedMotion ? 100 : 350 });
    const timer = setTimeout(() => setVisible(false), reducedMotion ? 120 : 370);
    return () => clearTimeout(timer);
  }, [minimumElapsed, opacity, ready, reducedMotion]);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: reducedMotion ? 0 : float.value }, { scale: reducedMotion ? 1 : pulse.value }] }));
  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  if (!visible) return null;

  return (
    <Animated.View style={[styles.splash, overlayStyle]} accessibilityViewIsModal>
      <View style={styles.circleOne} /><View style={styles.circleTwo} />
      <Animated.View style={[styles.logoBlock, logoStyle]}>
        <View style={styles.logoIcon}><Ionicons name="paw" size={42} color={colors.white} /></View>
        <Text style={styles.logoText}>PetSteps</Text>
        <Text style={styles.tagline}>Cada paso es una aventura</Text>
      </Animated.View>
      {!ready && <View style={styles.splashLoader}><PetStepsLoader size={42} message="Despertando a tu mascota..." /></View>}
      <Ionicons name="paw-outline" size={24} color="rgba(32,159,158,0.45)" style={styles.pawDecoration} />
    </Animated.View>
  );
}

function RewardModal() {
  const { feedback, clearFeedback } = useApp();
  const [reducedMotion, setReducedMotion] = useState(false);
  const scale = useSharedValue(0.82);
  const opacity = useSharedValue(0);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (feedback) {
      scale.value = reducedMotion ? 1 : withSpring(1, { damping: 11 });
      opacity.value = withTiming(1, { duration: reducedMotion ? 80 : 220 });
    }
  }, [feedback, opacity, reducedMotion, scale]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  const accessory = accessories.find((item) => item.id === feedback?.accessoryId);
  const pet = pets.find((item) => item.id === feedback?.petId);

  return (
    <Modal visible={Boolean(feedback)} transparent animationType="fade" onRequestClose={clearFeedback}>
      <View style={styles.rewardBackdrop}>
        {feedback && <Animated.View style={[styles.rewardCard, animatedStyle]}>
          <View style={styles.sparkleRow}><Ionicons name="sparkles" size={23} color={colors.yellow} /><Ionicons name="star" size={16} color={colors.coral} /><Ionicons name="sparkles" size={20} color={colors.teal} /></View>
          <LinearGradient colors={['#FFF4C9', '#FDE9E7']} style={styles.rewardArt}>
            {accessory ? <SpriteImage kind="accessory" index={accessory.spriteIndex} size={145} label={accessory.name} />
              : pet ? <SpriteImage kind="pet" index={pet.spriteIndex} size={145} label={pet.name} />
                : <Ionicons name={feedback.kind === 'challenge' ? 'flag' : feedback.kind === 'goal' ? 'footsteps' : 'trophy'} size={68} color={colors.coral} />}
          </LinearGradient>
          <Text style={styles.rewardTitle}>{feedback.title}</Text>
          <Text style={styles.rewardMessage}>{feedback.message}</Text>
          <View style={styles.rewardButton}><PrimaryButton label="¡Continuar!" onPress={clearFeedback} icon="sparkles" /></View>
        </Animated.View>}
      </View>
    </Modal>
  );
}

export function GlobalOverlays() {
  const { loadingMessage } = useApp();
  return (
    <>
      <RewardModal />
      <Modal visible={Boolean(loadingMessage)} transparent animationType="fade">
        <View style={styles.loaderBackdrop}><View style={styles.loaderCard}><PetStepsLoader size={72} message={loadingMessage ?? 'Preparando tu aventura...'} /></View></View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  splash: { position: 'absolute', inset: 0, zIndex: 100, elevation: 100, backgroundColor: '#E3F4F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  circleOne: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.48)', top: -80, right: -90 },
  circleTwo: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,202,72,0.16)', bottom: -55, left: -55 },
  logoBlock: { alignItems: 'center' },
  logoIcon: { width: 84, height: 84, borderRadius: 30, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }], ...shadow },
  logoText: { color: colors.brown, fontSize: 44, marginTop: spacing.md, ...roundedFont },
  tagline: { color: colors.tealDark, fontSize: 16, marginTop: spacing.xs, fontWeight: '700' },
  splashLoader: { position: 'absolute', bottom: '12%' },
  pawDecoration: { position: 'absolute', top: '20%', right: '18%', transform: [{ rotate: '18deg' }] },
  rewardBackdrop: { flex: 1, backgroundColor: 'rgba(50,35,27,0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  rewardCard: { width: '100%', maxWidth: 380, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', ...shadow },
  sparkleRow: { flexDirection: 'row', gap: 28, alignItems: 'center', marginBottom: spacing.sm },
  rewardArt: { width: 160, height: 160, borderRadius: 50, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rewardTitle: { color: colors.brown, fontSize: 24, lineHeight: 29, textAlign: 'center', marginTop: spacing.md, ...roundedFont },
  rewardMessage: { color: colors.muted, fontSize: 14, lineHeight: 20, fontWeight: '600', textAlign: 'center', marginTop: spacing.sm },
  rewardButton: { width: '100%', marginTop: spacing.lg },
  loaderBackdrop: { flex: 1, backgroundColor: 'rgba(250,247,241,0.94)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  loaderCard: { backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, ...shadow },
});
