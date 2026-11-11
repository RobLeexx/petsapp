import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { PressableScale, PrimaryButton, Screen, SpriteImage, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { pets } from '@/data';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';

export default function OnboardingScreen() {
  const { currentProfile, selectPet } = useApp();
  const { width } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reveal = useSharedValue(0.92);
  const selectedPet = pets.find((pet) => pet.id === selectedId);
  const cardWidth = Math.min(176, (width - spacing.md * 2 - 12) / 2);

  useEffect(() => {
    if (selectedId) {
      reveal.value = 0.92;
      reveal.value = withSpring(1, { damping: 10 });
    }
  }, [reveal, selectedId]);
  const revealStyle = useAnimatedStyle(() => ({ transform: [{ scale: reveal.value }] }));

  if (currentProfile?.role !== 'child') return null;

  const finish = async () => {
    if (!selectedId) return;
    await selectPet(currentProfile.id, selectedId);
    router.replace('/(child)');
  };

  return (
    <Screen>
      <View style={styles.topIcon}><Ionicons name="sparkles" size={24} color={colors.coral} /></View>
      <Text style={typography.eyebrow}>¡Hola, {currentProfile.nickname}!</Text>
      <Text style={[typography.title, styles.title]}>Elige a tu compañero de aventuras</Text>
      <Text style={typography.subtitle}>Cada mascota tiene una personalidad especial. ¿Cuál viajará contigo?</Text>

      {selectedPet && (
        <Animated.View style={[styles.reveal, revealStyle]}>
          <View style={styles.revealImage}><SpriteImage kind="pet" index={selectedPet.spriteIndex} size={120} label={selectedPet.name} /></View>
          <View style={styles.revealCopy}><Text style={styles.revealHello}>¡Hola! Soy {selectedPet.name}</Text><Text style={styles.revealText}>¡Tu aventura comienza hoy!</Text></View>
        </Animated.View>
      )}

      <View style={styles.grid}>
        {pets.map((pet) => {
          const selected = pet.id === selectedId;
          return (
            <PressableScale key={pet.id} onPress={() => setSelectedId(pet.id)} style={[styles.petCard, { width: cardWidth }, selected && styles.petCardSelected]} accessibilityLabel={`Elegir ${pet.name}`}>
              <View style={[styles.petImage, { backgroundColor: pet.color }]}><SpriteImage kind="pet" index={pet.spriteIndex} size={cardWidth - 18} label={pet.name} /></View>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text numberOfLines={2} style={styles.petPersonality}>{pet.personality}</Text>
              {selected && <View style={styles.check}><Ionicons name="checkmark" size={17} color={colors.white} /></View>}
            </PressableScale>
          );
        })}
      </View>
      {selectedPet && <PrimaryButton label="Comenzar aventura" onPress={finish} icon="rocket" />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topIcon: { marginTop: spacing.sm, width: 48, height: 48, borderRadius: 18, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  title: { marginTop: 5, marginBottom: spacing.sm },
  reveal: { marginTop: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, flexDirection: 'row', alignItems: 'center', ...shadow },
  revealImage: { width: 120, height: 120, overflow: 'hidden', borderRadius: 24 },
  revealCopy: { flex: 1, paddingLeft: 12, gap: 6 },
  revealHello: { color: colors.brown, fontSize: 17, ...roundedFont },
  revealText: { color: colors.tealDark, fontSize: 14, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginVertical: spacing.lg },
  petCard: { minHeight: 224, backgroundColor: colors.white, borderRadius: radius.md, padding: 9, borderWidth: 2, borderColor: 'transparent', ...shadow },
  petCardSelected: { borderColor: colors.teal },
  petImage: { alignItems: 'center', overflow: 'hidden', borderRadius: 16 },
  petName: { color: colors.brown, fontSize: 14, marginTop: 8, ...roundedFont },
  petPersonality: { color: colors.muted, fontSize: 11, lineHeight: 15, fontWeight: '600', marginTop: 3 },
  check: { position: 'absolute', top: 15, right: 15, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
});
