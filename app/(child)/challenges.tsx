import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pill, PressableScale, ProfileSwitcher, Screen, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { challenges } from '@/data';
import { Challenge } from '@/types';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';
import { router } from 'expo-router';

export default function ChallengesScreen() {
  const { currentProfile, completeChallenge } = useApp();
  const [selected, setSelected] = useState<Challenge | null>(null);
  if (currentProfile?.role !== 'child') return null;
  const completedIds = currentProfile.completedChallengeIds ?? [];

  return (
    <Screen>
      <View style={styles.header}><View><Text style={typography.eyebrow}>Misión del día</Text><Text style={typography.title}>Retos diarios</Text></View><ProfileSwitcher onPress={() => router.replace('/')} /></View>
      <Text style={[typography.subtitle, styles.intro]}>Pequeñas aventuras para moverte, divertirte y cuidar de ti.</Text>
      <View style={styles.summary}>
        <View style={styles.summaryIcon}><Ionicons name="flag" size={28} color={colors.coral} /></View>
        <View style={styles.summaryCopy}><Text style={styles.summaryTitle}>{currentProfile.completedChallengesToday} retos completados</Text><Text style={typography.body}>{currentProfile.completedChallengesToday >= currentProfile.dailyChallengesGoal ? '¡Misión del día conseguida! Puedes probar retos especiales.' : `Completa ${currentProfile.dailyChallengesGoal} para lograr la misión diaria.`}</Text></View>
      </View>
      <View style={styles.points}><Ionicons name="star" size={18} color={colors.yellow} /><Text style={styles.pointsText}>{currentProfile.dailyAwardedPoints ?? 0} puntos ganados hoy</Text></View>
      <View style={styles.list}>
        {challenges.map((challenge) => {
          const completed = completedIds.includes(challenge.id);
          return (
            <PressableScale key={challenge.id} onPress={() => setSelected(challenge)} style={styles.card} accessibilityLabel={`${challenge.name}, ${completed ? 'completado' : 'pendiente'}`}>
              <View style={[styles.icon, { backgroundColor: challenge.color }]}><Ionicons name={challenge.icon as keyof typeof Ionicons.glyphMap} size={29} color={colors.brown} /></View>
              <View style={styles.cardCopy}><View style={styles.titleRow}><Text style={styles.cardTitle}>{challenge.name}</Text>{completed && <Ionicons name="checkmark-circle" size={21} color={colors.green} />}</View><Text style={typography.body}>{challenge.description}</Text><Pill icon="star" text={`+${challenge.points} puntos`} color="#FFF2C9" /></View>
              <Ionicons name="chevron-forward" size={21} color={colors.muted} />
            </PressableScale>
          );
        })}
      </View>

      <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          {selected && <Pressable style={styles.modal} onPress={() => {}}><View style={[styles.modalIcon, { backgroundColor: selected.color }]}><Ionicons name={selected.icon as keyof typeof Ionicons.glyphMap} size={44} color={colors.brown} /></View><Text style={styles.modalTitle}>{selected.name}</Text><Text style={[typography.subtitle, styles.modalText]}>{selected.description}</Text><Pill icon="star" text={`${selected.points} puntos al completarlo`} color="#FFF2C9" />{completedIds.includes(selected.id) ? <View style={styles.done}><Ionicons name="checkmark-circle" size={20} color={colors.green} /><Text style={styles.doneText}>Reto completado hoy</Text></View> : <Pressable onPress={() => { completeChallenge(selected.id, currentProfile.id); setSelected(null); }} style={styles.complete}><Text style={styles.completeText}>Marcar como completado</Text></Pressable>}<Pressable onPress={() => setSelected(null)} style={styles.close}><Text style={styles.closeText}>Cerrar</Text></Pressable></Pressable>}
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  intro: { marginTop: spacing.sm },
  summary: { marginTop: spacing.lg, borderRadius: radius.md, backgroundColor: colors.pink, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIcon: { width: 52, height: 52, backgroundColor: colors.white, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: colors.brown, fontSize: 16, ...roundedFont },
  points: { flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'flex-start', marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  pointsText: { color: colors.brown, fontSize: 12, fontWeight: '800' },
  list: { gap: 12, marginTop: spacing.md },
  card: { minHeight: 130, backgroundColor: colors.white, borderRadius: radius.md, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow },
  icon: { width: 62, height: 62, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1, alignItems: 'flex-start', gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { color: colors.brown, fontSize: 16, flexShrink: 1, ...roundedFont },
  backdrop: { flex: 1, backgroundColor: 'rgba(50,35,27,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modal: { width: '100%', maxWidth: 380, backgroundColor: colors.white, borderRadius: radius.lg, alignItems: 'center', padding: spacing.lg, ...shadow },
  modalIcon: { width: 84, height: 84, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  modalTitle: { color: colors.brown, fontSize: 23, textAlign: 'center', ...roundedFont },
  modalText: { textAlign: 'center', marginVertical: spacing.sm },
  complete: { marginTop: spacing.lg, backgroundColor: colors.teal, borderRadius: radius.pill, paddingHorizontal: 24, paddingVertical: 13 },
  completeText: { color: colors.white, fontWeight: '900' },
  done: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: spacing.lg, backgroundColor: '#E4F4EB', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
  doneText: { color: colors.green, fontWeight: '900' },
  close: { marginTop: spacing.md, backgroundColor: colors.teal, borderRadius: radius.pill, paddingHorizontal: 30, paddingVertical: 13 },
  closeText: { color: colors.white, fontWeight: '900' },
});
