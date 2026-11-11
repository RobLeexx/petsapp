import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale, ProfileSwitcher, Screen, SpriteImage, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { accessories } from '@/data';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';

export default function AccessoriesScreen() {
  const { currentProfile, equipAccessory } = useApp();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(180, (width - spacing.md * 2 - 12) / 2);
  if (currentProfile?.role !== 'child') return null;

  return (
    <Screen>
      <View style={styles.header}><View><Text style={typography.eyebrow}>Recompensas</Text><Text style={typography.title}>Accesorios</Text></View><ProfileSwitcher onPress={() => router.replace('/')} /></View>
      <Text style={[typography.subtitle, styles.intro]}>Tus pasos y retos llenarán esta colección de objetos especiales.</Text>
      <View style={styles.counter}><Ionicons name="gift" size={25} color={colors.coral} /><View><Text style={styles.counterTitle}>{currentProfile.unlockedAccessories.length} de {accessories.length} desbloqueados</Text><Text style={typography.body}>Sigue moviéndote para descubrir más.</Text></View></View>
      <View style={styles.grid}>
        {accessories.map((accessory) => {
          const unlocked = currentProfile.unlockedAccessories.includes(accessory.id);
          const equipped = currentProfile.equippedAccessoryIds?.includes(accessory.id);
          return (
            <PressableScale key={accessory.id} onPress={() => unlocked && equipAccessory(accessory.id, currentProfile.id)} disabled={!unlocked} style={[styles.card, { width: cardWidth }, equipped && styles.equippedCard]} accessibilityLabel={`${accessory.name}, ${equipped ? 'equipado' : unlocked ? 'desbloqueado' : 'bloqueado'}`}>
              <View style={[styles.imageWrap, !unlocked && styles.locked]}><SpriteImage kind="accessory" index={accessory.spriteIndex} size={cardWidth - 18} label={accessory.name} /></View>
              <Text style={styles.name}>{accessory.name}</Text>
              <Text style={styles.requirement}>{accessory.requirement}</Text>
              <View style={[styles.status, { backgroundColor: equipped ? colors.coral : unlocked ? colors.green : '#9C8D83' }]}><Ionicons name={equipped ? 'paw' : unlocked ? 'checkmark' : 'lock-closed'} size={12} color={colors.white} /><Text style={styles.statusText}>{equipped ? 'Equipado' : unlocked ? 'Toca para equipar' : 'Bloqueado'}</Text></View>
            </PressableScale>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  intro: { marginTop: spacing.sm },
  counter: { marginTop: spacing.lg, padding: 14, borderRadius: radius.md, backgroundColor: colors.pink, flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterTitle: { color: colors.brown, fontSize: 16, ...roundedFont },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: spacing.md },
  card: { minHeight: 238, backgroundColor: colors.white, borderRadius: radius.md, padding: 9, ...shadow },
  equippedCard: { borderWidth: 2, borderColor: colors.coral },
  imageWrap: { backgroundColor: colors.blue, borderRadius: 17, overflow: 'hidden', alignItems: 'center' },
  locked: { opacity: 0.38 },
  name: { color: colors.brown, fontSize: 14, marginTop: 8, ...roundedFont },
  requirement: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: '600', minHeight: 29, marginTop: 3 },
  status: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 4, marginTop: 5 },
  statusText: { color: colors.white, fontSize: 9, fontWeight: '900' },
});
