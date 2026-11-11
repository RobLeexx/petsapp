import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale, PrimaryButton, ProfileSwitcher, Screen, SpriteImage, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { pets } from '@/data';
import { Pet } from '@/types';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';

export default function PetsScreen() {
  const { currentProfile, selectPet } = useApp();
  const [preview, setPreview] = useState<Pet | null>(null);
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(180, (width - spacing.md * 2 - 12) / 2);
  if (currentProfile?.role !== 'child') return null;

  const chooseFirstPet = async () => {
    if (!preview || currentProfile.activePetId) return;
    await selectPet(currentProfile.id, preview.id);
    setPreview(null);
  };

  return (
    <Screen>
      <View style={styles.header}><View><Text style={typography.eyebrow}>Compañeros</Text><Text style={typography.title}>Colección de mascotas</Text></View><ProfileSwitcher onPress={() => router.replace('/')} /></View>
      <Text style={[typography.subtitle, styles.intro]}>Conoce a los seis amigos de PetSteps. Toca una tarjeta para verla de cerca.</Text>
      <View style={styles.grid}>
        {pets.map((pet) => {
          const active = currentProfile.activePetId === pet.id;
          return (
            <PressableScale key={pet.id} onPress={() => setPreview(pet)} style={[styles.card, { width: cardWidth }, active && styles.activeCard]} accessibilityLabel={`${pet.name}${active ? ', mascota activa' : ''}`}>
              <View style={[styles.petImage, { backgroundColor: pet.color }]}><SpriteImage kind="pet" index={pet.spriteIndex} size={cardWidth - 16} label={pet.name} /></View>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text numberOfLines={2} style={styles.personality}>{pet.personality}</Text>
              {active && <View style={styles.activeBadge}><Ionicons name="checkmark" size={13} color={colors.white} /><Text style={styles.activeText}>Compañero</Text></View>}
            </PressableScale>
          );
        })}
      </View>

      <Modal visible={Boolean(preview)} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPreview(null)}>
          {preview && <Pressable style={styles.modal} onPress={() => {}}><View style={[styles.previewImage, { backgroundColor: preview.color }]}><SpriteImage kind="pet" index={preview.spriteIndex} size={250} label={preview.name} /></View><Text style={styles.previewName}>{preview.name}</Text><Text style={[typography.subtitle, styles.previewText]}>{preview.personality}</Text><View style={styles.stage}><Ionicons name="leaf" size={18} color={colors.tealDark} /><Text style={styles.stageText}>Etapa: {preview.stage}</Text></View>{!currentProfile.activePetId && <View style={styles.chooseButton}><PrimaryButton label="Elegir compañero" onPress={chooseFirstPet} icon="heart" /></View>}<Pressable onPress={() => setPreview(null)} style={styles.close}><Text style={styles.closeText}>Cerrar</Text></Pressable></Pressable>}
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  intro: { marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: spacing.lg },
  card: { minHeight: 228, backgroundColor: colors.white, borderRadius: radius.md, padding: 8, borderWidth: 2, borderColor: 'transparent', ...shadow },
  activeCard: { borderColor: colors.teal },
  petImage: { borderRadius: 17, overflow: 'hidden', alignItems: 'center' },
  petName: { color: colors.brown, fontSize: 14, marginTop: 8, ...roundedFont },
  personality: { color: colors.muted, fontSize: 11, lineHeight: 15, fontWeight: '600', marginTop: 3 },
  activeBadge: { alignSelf: 'flex-start', flexDirection: 'row', gap: 3, alignItems: 'center', backgroundColor: colors.teal, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 3, marginTop: 6 },
  activeText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  backdrop: { flex: 1, backgroundColor: 'rgba(50,35,27,0.46)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modal: { width: '100%', maxWidth: 380, backgroundColor: colors.white, borderRadius: radius.lg, alignItems: 'center', padding: spacing.md, ...shadow },
  previewImage: { width: 250, height: 250, borderRadius: radius.lg, overflow: 'hidden' },
  previewName: { color: colors.brown, fontSize: 25, marginTop: spacing.md, ...roundedFont },
  previewText: { textAlign: 'center', marginTop: 5 },
  stage: { marginTop: spacing.sm, backgroundColor: colors.blue, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', gap: 6 },
  stageText: { color: colors.tealDark, fontWeight: '800' },
  chooseButton: { width: '100%', marginTop: spacing.md },
  close: { padding: 12, marginTop: 5 },
  closeText: { color: colors.tealDark, fontWeight: '900' },
});
