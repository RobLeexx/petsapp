import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, Screen, SpriteImage, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';
import { PetStepsLoader } from '@/PetStepsLoader';

const cards = [
  { id: 'kid_new', title: 'Comenzar desde cero', name: 'ZorroBravo32', description: 'Niño nuevo', icon: 'sparkles' as const, colors: ['#FFF1C9', '#FFE0C0'] as const },
  { id: 'kid_progress', title: 'Continuar aventura', name: 'MiaExploradora', description: 'Nivel 8', icon: 'rocket' as const, colors: ['#DDF4F1', '#CFEFEB'] as const },
  { id: 'parent_demo', title: 'Panel familiar', name: 'Alex', description: 'Padre o tutor', icon: 'people' as const, colors: ['#FCE5E1', '#F7DAD6'] as const },
];

export default function WelcomeScreen() {
  const { hydrated, selectedProfileId, children, selectProfile } = useApp();

  const openProfile = async (id: string) => {
    await selectProfile(id);
    if (id === 'parent_demo') router.push('/(parent)');
    else if (!children.find((child) => child.id === id)?.activePetId) router.push('/onboarding');
    else router.push('/(child)');
  };

  if (!hydrated) return <View style={styles.loading}><PetStepsLoader message="Preparando tu aventura..." /></View>;

  return (
    <Screen contentStyle={styles.screen}>
      <LinearGradient colors={['#DDF4F3', '#FAF7F1']} style={styles.heroGlow} />
      <View style={styles.logoRow}>
        <View style={styles.logo}><Ionicons name="paw" size={28} color={colors.white} /></View>
        <Text style={styles.logoText}>PetSteps</Text>
      </View>
      <Text style={[typography.title, styles.title]}>Cada paso es{`\n`}una aventura</Text>
      <Text style={[typography.subtitle, styles.subtitle]}>Elige una historia de demostración y conoce a tu compañero.</Text>
      <View style={styles.petFriends} pointerEvents="none">
        <View style={styles.petBack}><SpriteImage kind="pet" index={3} size={105} label="Conejito" /></View>
        <View style={styles.petFront}><SpriteImage kind="pet" index={0} size={132} label="Zorro explorador" /></View>
        <View style={styles.petBack}><SpriteImage kind="pet" index={2} size={105} label="Gatito menta" /></View>
      </View>

      <Text style={styles.choose}>¿Quién quiere entrar?</Text>
      {cards.map((card) => {
        return (
          <PressableScale key={card.id} onPress={() => openProfile(card.id)} style={styles.card} accessibilityLabel={`${card.title}, ${card.name}`}>
            <LinearGradient colors={card.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
              <View style={styles.cardIcon}><Ionicons name={card.icon} size={25} color={colors.brown} /></View>
              <View style={styles.cardCopy}>
                <View style={styles.cardTitleRow}><Text style={styles.cardTitle}>{card.title}</Text>{selectedProfileId === card.id && <Text style={styles.recent}>Último</Text>}</View>
                <Text style={styles.cardName}>{card.name} · {card.description}</Text>
              </View>
              <Ionicons name="chevron-forward-circle" size={30} color={colors.brown} />
            </LinearGradient>
          </PressableScale>
        );
      })}
      <Text style={styles.demoLabel}>Experiencia local de demostración · Sin inicio de sesión</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  screen: { paddingTop: spacing.sm, overflow: 'hidden' },
  heroGlow: { position: 'absolute', left: -40, right: -40, top: -60, height: 430, borderBottomLeftRadius: 90, borderBottomRightRadius: 90 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }], ...shadow },
  logoText: { color: colors.brown, fontSize: 23, ...roundedFont },
  title: { fontSize: 38, lineHeight: 42, marginTop: spacing.lg },
  subtitle: { marginTop: spacing.sm, maxWidth: 315 },
  petFriends: { height: 145, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginTop: spacing.sm },
  petBack: { width: 92, height: 105, borderRadius: 28, overflow: 'hidden', opacity: 0.92 },
  petFront: { width: 132, height: 132, borderRadius: 38, overflow: 'hidden', marginHorizontal: -6, zIndex: 2, ...shadow },
  choose: { color: colors.brown, fontSize: 20, marginTop: 8, marginBottom: spacing.sm, ...roundedFont },
  card: { minHeight: 88, borderRadius: radius.md, overflow: 'hidden', marginBottom: 12, ...shadow },
  cardGradient: { minHeight: 88, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.72)', alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1, gap: 4 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardTitle: { color: colors.brown, fontSize: 16, ...roundedFont },
  cardName: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  recent: { color: colors.tealDark, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 2, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  demoLabel: { color: colors.muted, textAlign: 'center', fontSize: 11, marginTop: spacing.sm },
});
