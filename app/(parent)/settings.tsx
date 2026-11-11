import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { DemoButton, DemoPanel } from '@/DemoPanel';
import { ProfileSwitcher, Screen, typography } from '@/components';
import { useApp } from '@/context/AppContext';
import { colors, radius, roundedFont, shadow, spacing } from '@/theme';

function SettingRow({ icon, title, description, value, onValueChange }: { icon: keyof typeof Ionicons.glyphMap; title: string; description: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return <View style={styles.row}><View style={styles.icon}><Ionicons name={icon} size={23} color={colors.tealDark} /></View><View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDescription}>{description}</Text></View><Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#D6CEC7', true: '#9DDBCC' }} thumbColor={value ? colors.teal : '#F6F1EC'} accessibilityLabel={title} /></View>;
}

export default function ParentalSettingsScreen() {
  const { currentProfile, children, parentSettings, updateParentSettings, updateStepGoal, resetDemo } = useApp();
  const [supervision, setSupervision] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<'kid_new' | 'kid_progress'>('kid_progress');
  const [demoVisible, setDemoVisible] = useState(false);
  if (currentProfile?.role !== 'parent') return null;
  const selectedChild = children.find((child) => child.id === selectedChildId) ?? children[0];

  const reset = () => Alert.alert('Restablecer demostración', 'Se restaurarán los perfiles, progresos y ajustes originales.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Restablecer', style: 'destructive', onPress: async () => { await resetDemo(); router.replace('/'); } },
  ]);

  return (
    <Screen>
      <View style={styles.header}><View><Text style={typography.eyebrow}>Preferencias familiares</Text><Text style={typography.title}>Controles</Text></View><View style={styles.headerActions}><ProfileSwitcher onPress={() => router.replace('/')} /><DemoButton onPress={() => setDemoVisible(true)} /></View></View>
      <View style={styles.demoBanner}><Ionicons name="flask" size={23} color={colors.coral} /><View style={styles.demoCopyWrap}><Text style={styles.demoTitle}>Configuración de demostración</Text><Text style={styles.demoCopy}>Estos controles son locales y no cambian ajustes reales del dispositivo.</Text></View></View>

      <View style={styles.card}>
        <SettingRow icon="shield-checkmark" title="Modo seguro" description="Simula una experiencia con contenido apropiado." value={parentSettings.safeMode} onValueChange={(safeMode) => updateParentSettings({ safeMode })} />
        <SettingRow icon="chatbubbles" title="Chat y mensajería" description="Activa o desactiva esta preferencia simulada." value={parentSettings.chatEnabled} onValueChange={(chatEnabled) => updateParentSettings({ chatEnabled })} />
        <SettingRow icon="eye" title="Supervisión de actividad" description="Muestra los resúmenes locales del panel familiar." value={supervision} onValueChange={setSupervision} />
      </View>

      <Text style={styles.sectionTitle}>Meta diaria de pasos</Text>
      <View style={styles.childSelector}>{children.map((child) => <Pressable key={child.id} onPress={() => setSelectedChildId(child.id)} style={[styles.childChip, selectedChildId === child.id && styles.childChipActive]}><Text style={[styles.childChipText, selectedChildId === child.id && styles.childChipTextActive]}>{child.nickname}</Text></Pressable>)}</View>
      <View style={styles.limitCard}>
        <Pressable onPress={() => updateStepGoal(selectedChild.id, selectedChild.dailyStepGoal - 500)} style={styles.stepper} accessibilityLabel="Reducir meta de pasos"><Ionicons name="remove" size={22} color={colors.tealDark} /></Pressable>
        <View style={styles.limitCopy}><Text style={styles.goalValue}>{selectedChild.dailyStepGoal.toLocaleString('es-ES')}</Text><Text style={styles.limitLabel}>pasos al día</Text></View>
        <Pressable onPress={() => updateStepGoal(selectedChild.id, selectedChild.dailyStepGoal + 500)} style={styles.stepper} accessibilityLabel="Aumentar meta de pasos"><Ionicons name="add" size={22} color={colors.tealDark} /></Pressable>
      </View>

      <Text style={styles.sectionTitle}>Tiempo de pantalla diario</Text>
      <View style={styles.limitCard}>
        <Pressable onPress={() => updateParentSettings({ dailyScreenLimitMinutes: Math.max(15, parentSettings.dailyScreenLimitMinutes - 15) })} style={styles.stepper} accessibilityLabel="Reducir tiempo"><Ionicons name="remove" size={22} color={colors.tealDark} /></Pressable>
        <View style={styles.limitCopy}><Text style={styles.limitValue}>{parentSettings.dailyScreenLimitMinutes}</Text><Text style={styles.limitLabel}>minutos al día</Text></View>
        <Pressable onPress={() => updateParentSettings({ dailyScreenLimitMinutes: Math.min(180, parentSettings.dailyScreenLimitMinutes + 15) })} style={styles.stepper} accessibilityLabel="Aumentar tiempo"><Ionicons name="add" size={22} color={colors.tealDark} /></Pressable>
      </View>

      <Text style={styles.sectionTitle}>Horario permitido</Text>
      <View style={styles.schedule}><Pressable style={styles.time} onPress={() => updateParentSettings({ allowedFrom: parentSettings.allowedFrom === '07:00' ? '08:00' : '07:00' })} accessibilityLabel="Cambiar hora de inicio"><Ionicons name="sunny" size={21} color={colors.yellow} /><Text style={styles.timeLabel}>Desde · toca para cambiar</Text><Text style={styles.timeValue}>{parentSettings.allowedFrom}</Text></Pressable><Ionicons name="arrow-forward" size={20} color={colors.muted} /><Pressable style={styles.time} onPress={() => updateParentSettings({ allowedTo: parentSettings.allowedTo === '20:00' ? '21:00' : '20:00' })} accessibilityLabel="Cambiar hora final"><Ionicons name="moon" size={21} color="#7566A8" /><Text style={styles.timeLabel}>Hasta · toca para cambiar</Text><Text style={styles.timeValue}>{parentSettings.allowedTo}</Text></Pressable></View>

      <Pressable onPress={reset} style={styles.reset} accessibilityRole="button"><Ionicons name="refresh" size={20} color={colors.coral} /><Text style={styles.resetText}>Restablecer demostración</Text></Pressable>
      <Text style={styles.disclaimer}>PetSteps no aplica límites del sistema, bloqueos ni protecciones reales. Esta pantalla solo representa la experiencia visual prevista.</Text>
      <DemoPanel visible={demoVisible} onClose={() => setDemoVisible(false)} childId={selectedChildId} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  headerActions: { alignItems: 'flex-end', gap: 3 },
  demoBanner: { backgroundColor: colors.pink, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 11 },
  demoCopyWrap: { flex: 1 },
  demoTitle: { color: colors.brown, fontSize: 15, ...roundedFont },
  demoCopy: { color: colors.muted, fontSize: 11, lineHeight: 16, fontWeight: '600' },
  card: { marginTop: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: spacing.md, ...shadow },
  row: { minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: colors.line },
  icon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  rowTitle: { color: colors.brown, fontSize: 15, ...roundedFont },
  rowDescription: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: '600', marginTop: 3 },
  sectionTitle: { color: colors.brown, fontSize: 18, marginTop: spacing.lg, marginBottom: spacing.sm, ...roundedFont },
  childSelector: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  childChip: { flex: 1, minHeight: 40, borderRadius: radius.pill, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.line },
  childChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  childChipText: { color: colors.brown, fontSize: 11, fontWeight: '800' },
  childChipTextActive: { color: colors.white },
  limitCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadow },
  stepper: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  limitCopy: { alignItems: 'center' },
  limitValue: { color: colors.brown, fontSize: 30, ...roundedFont },
  goalValue: { color: colors.brown, fontSize: 24, ...roundedFont },
  limitLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  schedule: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', ...shadow },
  time: { alignItems: 'center', gap: 3, flex: 1 },
  timeLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', textAlign: 'center' },
  timeValue: { color: colors.brown, fontSize: 18, ...roundedFont },
  reset: { marginTop: spacing.xl, minHeight: 52, borderWidth: 2, borderColor: '#F4C9C2', borderRadius: radius.pill, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
  resetText: { color: colors.coral, fontWeight: '900' },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.md },
});
