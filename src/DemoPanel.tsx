import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from './context/AppContext';
import { evolutionForLevel, evolutionLabel } from './game';
import { ActivityCategory, ChildProfile } from './types';
import { colors, radius, roundedFont, shadow, spacing } from './theme';

const categoryActions: { category: ActivityCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { category: 'sport', label: 'Deporte', icon: 'fitness' },
  { category: 'outdoor', label: 'Exterior', icon: 'leaf' },
  { category: 'reading', label: 'Lectura', icon: 'book' },
  { category: 'educational_screen', label: 'Pantalla educativa', icon: 'tablet-portrait' },
];

export function DemoButton({ onPress }: { onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.demoButton} accessibilityRole="button"><Ionicons name="flask-outline" size={15} color={colors.tealDark} /><Text style={styles.demoButtonText}>Modo demo</Text></Pressable>;
}

export function DemoPanel({ visible, onClose, childId }: { visible: boolean; onClose: () => void; childId: ChildProfile['id'] }) {
  const { children, addSteps, addActivityMinutes, completeNextChallenge, advanceSimulation, previewAchievement, previewEvolution, previewLoader, replaySplash, resetDemo } = useApp();
  const [customSteps, setCustomSteps] = useState('');
  const child = children.find((item) => item.id === childId) ?? children[0];
  const activeProgress = child.activePetId ? child.petProgress?.[child.activePetId] : undefined;
  const nextStage = (activeProgress?.level ?? 1) < 4 ? { level: 4, stage: evolutionForLevel(4) } : { level: 10, stage: evolutionForLevel(10) };

  const applyCustomSteps = () => {
    const amount = Number(customSteps);
    if (!Number.isFinite(amount) || amount <= 0) return Alert.alert('Cantidad no válida', 'Escribe un número positivo de hasta 50.000 pasos.');
    addSteps(Math.min(50000, amount), childId);
    setCustomSteps('');
  };

  const reset = () => Alert.alert('Restablecer demostración', 'Se restaurarán los perfiles, progresos y ajustes originales.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Restablecer', style: 'destructive', onPress: async () => { await resetDemo(); onClose(); router.replace('/'); } },
  ]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.panel} edges={['bottom']}>
          <View style={styles.handle} />
          <View style={styles.header}><View><Text style={styles.eyebrow}>Herramientas de presentación</Text><Text style={styles.title}>Modo demo</Text></View><Pressable onPress={onClose} style={styles.close} accessibilityLabel="Cerrar modo demo"><Ionicons name="close" size={24} color={colors.brown} /></Pressable></View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.progressCard}><View><Text style={styles.progressName}>{child.nickname}</Text><Text style={styles.progressMeta}>Nivel {child.level} · {child.currentLevelXp ?? 0}/{child.xpRequiredForNextLevel ?? 100} XP · {child.dailyAwardedPoints ?? 0} puntos hoy</Text></View><Ionicons name="sparkles" size={25} color={colors.yellow} /></View>

            <Text style={styles.section}>Simular pasos</Text>
            <View style={styles.actionRow}>{[250, 1000, 5000].map((amount) => <Action key={amount} label={`+${amount.toLocaleString('es-ES')}`} icon="footsteps" onPress={() => addSteps(amount, childId)} />)}</View>
            <View style={styles.customRow}><TextInput value={customSteps} onChangeText={setCustomSteps} keyboardType="number-pad" placeholder="Cantidad personalizada" placeholderTextColor={colors.muted} style={styles.input} maxLength={5} accessibilityLabel="Cantidad personalizada de pasos" /><Pressable onPress={applyCustomSteps} style={styles.addCustom}><Text style={styles.addCustomText}>Añadir</Text></Pressable></View>

            <Text style={styles.section}>Añadir 10 minutos</Text>
            <View style={styles.grid}>{categoryActions.map((action) => <Action key={action.category} label={action.label} icon={action.icon} onPress={() => addActivityMinutes(action.category, 10, childId)} />)}</View>

            <Text style={styles.section}>Tiempo y juego</Text>
            <View style={styles.grid}><Action label="Avanzar un día" icon="today" onPress={() => advanceSimulation(1, childId)} /><Action label="Simular 7 días" icon="calendar" onPress={() => advanceSimulation(7, childId)} /><Action label="Completar reto" icon="flag" onPress={() => completeNextChallenge(childId)} /><Action label="Ver logro" icon="trophy" onPress={() => previewAchievement(childId)} /></View>
            <Pressable style={styles.milestone} onPress={() => previewEvolution(childId)}><Ionicons name="rocket" size={24} color={colors.coral} /><View><Text style={styles.milestoneTitle}>Próxima evolución: {evolutionLabel(nextStage.stage)}</Text><Text style={styles.milestoneCopy}>Nivel {nextStage.level} · Toca para ver una vista previa segura.</Text></View></Pressable>

            <Text style={styles.section}>Aplicación</Text>
            <View style={styles.grid}><Action label="Ver loader" icon="color-palette" onPress={previewLoader} /><Action label="Repetir splash" icon="paw" onPress={() => { onClose(); setTimeout(replaySplash, 100); }} /><Action label="Cambiar perfil" icon="people" onPress={() => { onClose(); router.replace('/'); }} /><Action label="Restablecer" icon="refresh" danger onPress={reset} /></View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function Action({ label, icon, onPress, danger = false }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; danger?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.action, danger && styles.actionDanger]} accessibilityRole="button"><Ionicons name={icon} size={20} color={danger ? colors.coral : colors.tealDark} /><Text style={[styles.actionText, danger && styles.actionTextDanger]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  demoButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.blue, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 7 },
  demoButtonText: { color: colors.tealDark, fontSize: 11, fontWeight: '800' },
  backdrop: { flex: 1, backgroundColor: 'rgba(50,35,27,0.45)', justifyContent: 'flex-end' },
  panel: { maxHeight: '90%', backgroundColor: colors.cream, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingTop: spacing.sm, ...shadow },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#D8CEC5', alignSelf: 'center', marginBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  eyebrow: { color: colors.tealDark, fontSize: 10, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  title: { color: colors.brown, fontSize: 25, ...roundedFont },
  close: { width: 42, height: 42, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  progressCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressName: { color: colors.brown, fontSize: 16, ...roundedFont },
  progressMeta: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 3 },
  section: { color: colors.brown, fontSize: 16, marginTop: spacing.lg, marginBottom: spacing.sm, ...roundedFont },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { minHeight: 48, minWidth: '31%', flexGrow: 1, flexBasis: '31%', borderRadius: radius.sm, backgroundColor: colors.white, paddingHorizontal: spacing.sm, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionDanger: { backgroundColor: colors.pink },
  actionText: { color: colors.brown, fontSize: 10, textAlign: 'center', fontWeight: '800' },
  actionTextDanger: { color: colors.coral },
  customRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  input: { flex: 1, minHeight: 48, backgroundColor: colors.white, borderRadius: radius.sm, paddingHorizontal: spacing.md, color: colors.brown, fontWeight: '700' },
  addCustom: { minWidth: 88, borderRadius: radius.sm, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  addCustomText: { color: colors.white, fontWeight: '900' },
  milestone: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: '#FFF0C9', borderRadius: radius.md, padding: spacing.md },
  milestoneTitle: { color: colors.brown, fontSize: 13, ...roundedFont },
  milestoneCopy: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: '600', maxWidth: 280, marginTop: 2 },
});
