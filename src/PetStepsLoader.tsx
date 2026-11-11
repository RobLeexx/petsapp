import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, roundedFont } from './theme';

export type PetStepsLoaderProps = {
  size?: number;
  message?: string;
  showMessage?: boolean;
};

const loaderColors = {
  orange: '#ff3d00',
  pink: '#f63a99',
  cyan: '#30dcf6',
  yellow: '#f2d200',
  green: '#70ca5c',
  highlight: 'rgba(255,255,255,0.5)',
  shadow: 'rgba(0,0,0,0.25)',
  woodenHandle: '#e09c5f',
};

export function PetStepsLoader({ size = 72, message = 'Preparando tu aventura...', showMessage = true }: PetStepsLoaderProps) {
  const offset = useSharedValue(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const segmentHeight = size * 1.75;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!reducedMotion) offset.value = withRepeat(withTiming(-segmentHeight, { duration: 6000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(offset);
  }, [offset, reducedMotion, segmentHeight]);

  const movingStyle = useAnimatedStyle(() => ({ transform: [{ translateY: reducedMotion ? 0 : offset.value }] }));
  const gradientProps = {
    colors: [loaderColors.pink, loaderColors.cyan, loaderColors.yellow, loaderColors.green, loaderColors.pink] as const,
    locations: [0, 0.25, 0.5, 0.75, 1] as const,
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  };

  return (
    <View style={styles.wrapper} accessibilityRole="progressbar" accessibilityLabel={message}>
      <View style={{ width: size, height: size * 1.88 }}>
        <View style={[styles.handle, { width: size * 0.32, height: size * 0.45, left: size * 0.34, top: size * 1.42, borderBottomLeftRadius: size * 0.12, borderBottomRightRadius: size * 0.12 }]} />
        <View style={[styles.body, { width: size, height: size * 1.5, borderTopLeftRadius: size * 0.55, borderTopRightRadius: size * 0.55, borderBottomLeftRadius: size * 0.1, borderBottomRightRadius: size * 0.1 }]}>
          <Animated.View style={[{ height: segmentHeight * 2 }, movingStyle]}>
            <LinearGradient {...gradientProps} style={{ width: size, height: segmentHeight }} />
            <LinearGradient {...gradientProps} style={{ width: size, height: segmentHeight }} />
          </Animated.View>
          <View style={[styles.highlight, { left: size * 0.1, bottom: size * 0.15, width: size * 0.15, height: size, borderRadius: size * 0.08 }]} />
          <View style={[styles.orangeEdge, { height: size * 0.07 }]} />
        </View>
      </View>
      {showMessage && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  body: { position: 'absolute', top: 0, overflow: 'hidden', backgroundColor: loaderColors.pink, shadowColor: loaderColors.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 8 },
  handle: { position: 'absolute', backgroundColor: loaderColors.woodenHandle },
  highlight: { position: 'absolute', backgroundColor: loaderColors.highlight },
  orangeEdge: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: loaderColors.orange, opacity: 0.78 },
  message: { color: colors.brown, fontSize: 14, marginTop: 10, textAlign: 'center', ...roundedFont },
});
